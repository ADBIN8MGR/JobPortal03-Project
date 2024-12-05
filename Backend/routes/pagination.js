const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Pagination route
router.get('/', async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Validate page and limit
    if (page < 1 || limit < 1) {
        return res.status(400).json({ success: false, message: 'Page and limit must be positive integers.' });
    }

    const offset = (page - 1) * limit;

    try {
        // Get total count of jobs
        const [totalCountRows] = await db.query('SELECT COUNT(*) AS total FROM jobs');
        const total = totalCountRows[0].total;

        // Fetch paginated jobs
        const [jobs] = await db.query('SELECT * FROM jobs LIMIT ? OFFSET ?', [limit, offset]);

        // Return data with pagination details
        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (err) {
        console.error('Error fetching paginated jobs:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;












// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// router.get('/', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     const sql = `SELECT * FROM jobs LIMIT ? OFFSET ?`;
//     db.query(sql, [limit, offset], (err, results) => {
//         if (err) return res.status(500).send('Server error');
//         res.status(200).json(results);
//     });
// });

// module.exports = router;
