const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, status, limit = 50 } = req.query;
    
    let query = admin.firestore().collection('sales');
    
    // Apply date filters
    if (startDate) {
      query = query.where('transactionDate', '>=', new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('transactionDate', '<=', new Date(endDate));
    }
    
    // Apply status filter
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const sales = [];
    snapshot.forEach(doc => {
      sales.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      sales,
      total: sales.length,
    });
    
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales',
      message: error.message,
    });
  }
});

// Get sales statistics
router.get('/stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let startDate = null;
    const now = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // All time - no date filter
        break;
    }
    
    let query = admin.firestore().collection('sales').where('status', '==', 'completed');
    
    if (startDate) {
      query = query.where('transactionDate', '>=', startDate);
    }
    
    const snapshot = await query.get();
    
    let totalRevenue = 0;
    let totalSales = 0;
    const materialSales = {};
    const dailySales = {};
    
    snapshot.forEach(doc => {
      const sale = doc.data();
      totalRevenue += sale.amount;
      totalSales += 1;
      
      // Track material sales
      sale.cartItems.forEach(item => {
        if (materialSales[item.title]) {
          materialSales[item.title] += 1;
        } else {
          materialSales[item.title] = 1;
        }
      });
      
      // Track daily sales
      const dateKey = sale.transactionDate.toDate().toISOString().split('T')[0];
      if (dailySales[dateKey]) {
        dailySales[dateKey] += sale.amount;
      } else {
        dailySales[dateKey] = sale.amount;
      }
    });
    
    // Get top selling materials
    const topMaterials = Object.entries(materialSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
    
    // Get daily sales for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateKey,
        revenue: dailySales[dateKey] || 0,
      });
    }
    
    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalSales,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        topMaterials,
        dailySales: last7Days,
        period,
      },
    });
    
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales statistics',
      message: error.message,
    });
  }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await admin.firestore().collection('sales').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Sale not found',
      });
    }
    
    res.json({
      success: true,
      sale: {
        id: doc.id,
        ...doc.data(),
      },
    });
    
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      error: 'Failed to fetch sale',
      message: error.message,
    });
  }
});

// Create new sale (for testing purposes)
router.post('/', async (req, res) => {
  try {
    const {
      transactionId,
      mpesaReceiptNumber,
      customerPhone,
      amount,
      cartItems,
    } = req.body;
    
    // Validate required fields
    if (!transactionId || !customerPhone || !amount || !cartItems) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Transaction ID, customer phone, amount, and cart items are required',
      });
    }
    
    const saleData = {
      transactionId,
      mpesaReceiptNumber,
      customerPhone,
      amount: parseFloat(amount),
      cartItems,
      transactionDate: new Date(),
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await admin.firestore().collection('sales').add(saleData);
    
    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      sale: {
        id: docRef.id,
        ...saleData,
      },
    });
    
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      error: 'Failed to create sale',
      message: error.message,
    });
  }
});

// Update sale status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
      });
    }
    
    // Check if sale exists
    const doc = await admin.firestore().collection('sales').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Sale not found',
      });
    }
    
    // Update status
    await admin.firestore().collection('sales').doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({
      success: true,
      message: 'Sale status updated successfully',
    });
    
  } catch (error) {
    console.error('Update sale status error:', error);
    res.status(500).json({
      error: 'Failed to update sale status',
      message: error.message,
    });
  }
});

// Get sales by customer phone
router.get('/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const snapshot = await admin.firestore()
      .collection('sales')
      .where('customerPhone', '==', phone)
      .orderBy('createdAt', 'desc')
      .get();
    
    const sales = [];
    snapshot.forEach(doc => {
      sales.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      sales,
      total: sales.length,
    });
    
  } catch (error) {
    console.error('Get customer sales error:', error);
    res.status(500).json({
      error: 'Failed to fetch customer sales',
      message: error.message,
    });
  }
});

// Export sales report
router.get('/export/report', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    let query = admin.firestore().collection('sales').where('status', '==', 'completed');
    
    if (startDate) {
      query = query.where('transactionDate', '>=', new Date(startDate));
    }
    
    if (endDate) {
      query = query.where('transactionDate', '<=', new Date(endDate));
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const sales = [];
    snapshot.forEach(doc => {
      sales.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    if (format === 'csv') {
      // Generate CSV format
      const csvHeader = 'Transaction ID,Receipt Number,Customer Phone,Amount,Date,Status\n';
      const csvData = sales.map(sale => {
        const date = sale.transactionDate.toDate().toISOString().split('T')[0];
        return `${sale.transactionId},${sale.mpesaReceiptNumber || ''},${sale.customerPhone},${sale.amount},${date},${sale.status}`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
      res.send(csvHeader + csvData);
    } else {
      // Return JSON format
      res.json({
        success: true,
        report: {
          sales,
          total: sales.length,
          totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
          period: { startDate, endDate },
        },
      });
    }
    
  } catch (error) {
    console.error('Export sales report error:', error);
    res.status(500).json({
      error: 'Failed to export sales report',
      message: error.message,
    });
  }
});

module.exports = router; 