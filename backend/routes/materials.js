const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Get all materials
router.get('/', async (req, res) => {
  try {
    const { subject, level, search } = req.query;
    
    let query = admin.firestore().collection('materials');
    
    // Apply filters
    if (subject && subject !== 'All') {
      query = query.where('subject', '==', subject);
    }
    
    if (level && level !== 'All') {
      query = query.where('level', '==', level);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    let materials = [];
    snapshot.forEach(doc => {
      materials.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      materials = materials.filter(material =>
        material.title.toLowerCase().includes(searchLower) ||
        material.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      materials,
      total: materials.length,
    });
    
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      error: 'Failed to fetch materials',
      message: error.message,
    });
  }
});

// Stream material PDF file (used for preview)
router.get('/:id/file', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await admin.firestore().collection('materials').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = doc.data();
    if (!material.filePath) {
      return res.status(400).json({ error: 'Material file not available' });
    }

    const bucket = admin.storage().bucket();
    const file = bucket.file(material.filePath);

    // Basic headers for inline PDF viewing and CORS
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${(material.fileName || 'material')}.pdf"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    file.createReadStream()
      .on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to read file' });
        } else {
          try { res.end(); } catch (_) {}
        }
      })
      .pipe(res);
  } catch (error) {
    console.error('Get material file error:', error);
    res.status(500).json({ error: 'Failed to fetch material file', message: error.message });
  }
});

// Get material by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await admin.firestore().collection('materials').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }
    
    res.json({
      success: true,
      material: {
        id: doc.id,
        ...doc.data(),
      },
    });
    
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      error: 'Failed to fetch material',
      message: error.message,
    });
  }
});

// Create new material
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      level,
      price,
      year,
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !subject || !level || !price || !year) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, subject, level, price, and year are required',
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'PDF file is required',
      });
    }
    
    // Upload file to Firebase Storage
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = `materials/${fileName}`;
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    
    await file.save(req.file.buffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });
    
    // Get download URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });
    
    // Save material data to Firestore
    const materialData = {
      title: title.trim(),
      description: description.trim(),
      subject,
      level,
      price: parseFloat(price),
      year: year.trim(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath,
      downloadURL: url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await admin.firestore().collection('materials').add(materialData);
    
    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material: {
        id: docRef.id,
        ...materialData,
      },
    });
    
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      error: 'Failed to create material',
      message: error.message,
    });
  }
});

// Update material
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      subject,
      level,
      price,
      year,
    } = req.body;
    
    // Check if material exists
    const doc = await admin.firestore().collection('materials').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }
    
    // Update material data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (subject) updateData.subject = subject;
    if (level) updateData.level = level;
    if (price) updateData.price = parseFloat(price);
    if (year) updateData.year = year.trim();
    
    await admin.firestore().collection('materials').doc(id).update(updateData);
    
    // Get updated material
    const updatedDoc = await admin.firestore().collection('materials').doc(id).get();
    
    res.json({
      success: true,
      message: 'Material updated successfully',
      material: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
    
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      error: 'Failed to update material',
      message: error.message,
    });
  }
});

// Delete material
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if material exists
    const doc = await admin.firestore().collection('materials').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }
    
    const materialData = doc.data();
    
    // Delete file from Firebase Storage
    if (materialData.filePath) {
      const bucket = admin.storage().bucket();
      const file = bucket.file(materialData.filePath);
      await file.delete();
    }
    
    // Delete from Firestore
    await admin.firestore().collection('materials').doc(id).delete();
    
    res.json({
      success: true,
      message: 'Material deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      error: 'Failed to delete material',
      message: error.message,
    });
  }
});

// Get materials by subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    
    const snapshot = await admin.firestore()
      .collection('materials')
      .where('subject', '==', subject)
      .orderBy('createdAt', 'desc')
      .get();
    
    const materials = [];
    snapshot.forEach(doc => {
      materials.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      materials,
      total: materials.length,
    });
    
  } catch (error) {
    console.error('Get materials by subject error:', error);
    res.status(500).json({
      error: 'Failed to fetch materials',
      message: error.message,
    });
  }
});

// Get materials by level
router.get('/level/:level', async (req, res) => {
  try {
    const { level } = req.params;
    
    const snapshot = await admin.firestore()
      .collection('materials')
      .where('level', '==', level)
      .orderBy('createdAt', 'desc')
      .get();
    
    const materials = [];
    snapshot.forEach(doc => {
      materials.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      materials,
      total: materials.length,
    });
    
  } catch (error) {
    console.error('Get materials by level error:', error);
    res.status(500).json({
      error: 'Failed to fetch materials',
      message: error.message,
    });
  }
});

module.exports = router; 