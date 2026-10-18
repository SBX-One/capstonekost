const fs = require('fs');
const path = require('path');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

module.exports = (req, res, next) => {
    const db = req.app.db;

    const processUploadedFiles = (files, existingImages = []) => {
        let currentImages = [...existingImages];
        let nextId = currentImages.length > 0 ? Math.max(...currentImages.map(i => i.id)) + 1 : 1;

        if (files && files.length > 0) {
            const imageFiles = files.filter(f => f.fieldname.startsWith('images[') && f.fieldname.endsWith(']'));

            imageFiles.forEach((file) => {
                const match = file.fieldname.match(/images\[(\d+)\]/);
                const slotIndex = match ? parseInt(match[1], 10) : 0;

                const fileName = `img_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);

                currentImages.push({
                    id: nextId++,
                    image_path: `/uploads/${fileName}`,
                    sort_order: slotIndex + 1
                });
            });
        }
        return currentImages.sort((a, b) => a.sort_order - b.sort_order);
    };

    // --- GET ROOMS ---
    if (req.method === 'GET' && (req.path === '/api/admin/rooms' || req.path === '/rooms')) {
        let rooms = db.get('rooms').value() || [];
        const query = req.query;

        if (query.search) {
            const keyword = query.search.toLowerCase();
            rooms = rooms.filter(r => (r.name && r.name.toLowerCase().includes(keyword)) || (r.description && r.description.toLowerCase().includes(keyword)));
        }
        if (query.status) rooms = rooms.filter(r => r.status === query.status);
        if (query.floor) rooms = rooms.filter(r => String(r.floor) === String(query.floor));
        if (query.room_type) rooms = rooms.filter(r => String(r.room_type?.id) === String(query.room_type) || String(r.room_type?.name).toLowerCase().includes(query.room_type.toLowerCase()));
        if (query.min_price) rooms = rooms.filter(r => r.price >= Number(query.min_price));
        if (query.max_price) rooms = rooms.filter(r => r.price <= Number(query.max_price));

        const total = rooms.length;
        const page = parseInt(query.page || query._page, 10) || 1;
        const limit = parseInt(query.per_page || query._limit, 10) || 10;
        const paginatedRooms = rooms.slice((page - 1) * limit, (page - 1) * limit + limit);

        return res.json({
            message: "Successfully fetched data",
            data: paginatedRooms,
            meta: { current_page: page, per_page: limit, total: total, last_page: Math.ceil(total / limit) || 1 }
        });
    }

    // --- CREATE ROOM ---
    if (req.method === 'POST' && (req.path === '/api/admin/create' || req.path === '/admin/create')) {
        try {
            const rooms = db.get('rooms').value() || [];
            const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;

            let parsedFacilities = [];
            const facInput = req.body['facilities[]'];
            if (facInput) {
                const facArray = Array.isArray(facInput) ? facInput : [facInput];
                parsedFacilities = facArray.map(id => ({ id: Number(id), name: `Facility ${id}` }));
            }

            const newRoom = {
                id: newId,
                name: req.body.name,
                room_type: {
                    id: Number(req.body.room_type),
                    name: req.body.room_type == 1 ? "Single Room" : req.body.room_type == 2 ? "Double Room" : "Master Room"
                },
                floor: Number(req.body.floor),
                price: Number(req.body.price),
                status: req.body.status || 'available',
                overview: req.body.overview || '',
                description: req.body.description || '',
                rules: req.body.rules || '',
                images: processUploadedFiles(req.files, []),
                facilities: parsedFacilities,
                utilities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            db.get('rooms').push(newRoom).write();
            return res.status(201).json({ message: "Room data created", data: newRoom });
        } catch (error) {
            console.error("Create Error:", error);
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    // --- UPDATE ROOM ---
    const updateMatch = req.path.match(/^\/(?:api\/)?admin\/update\/(\d+)$/);

    if (updateMatch && (req.method === 'PATCH' || req.method === 'POST' || req.method === 'PUT')) {
        const roomId = parseInt(updateMatch[1], 10);
        const roomsDB = db.get('rooms');
        const roomExists = roomsDB ? roomsDB.find({ id: roomId }).value() : null;

        if (!roomExists) return res.status(404).json({ message: "Room not found" });

        try {
            const updatedData = {
                ...roomExists,
                name: req.body.name || roomExists.name,
                floor: req.body.floor ? Number(req.body.floor) : roomExists.floor,
                price: req.body.price ? Number(req.body.price) : roomExists.price,
                status: req.body.status || roomExists.status,
                overview: req.body.overview || roomExists.overview,
                description: req.body.description || roomExists.description,
                rules: req.body.rules || roomExists.rules,
                updated_at: new Date().toISOString()
            };

            if (req.body.room_type) {
                updatedData.room_type = {
                    id: Number(req.body.room_type),
                    name: req.body.room_type == 1 ? "Single Room" : req.body.room_type == 2 ? "Double Room" : "Master Room"
                };
            }

            let parsedFacilities = updatedData.facilities;
            const facInput = req.body['facilities[]'] || req.body.facilities;
            if (facInput) {
                const facArray = Array.isArray(facInput) ? facInput : [facInput];
                parsedFacilities = facArray.map(id => ({ id: Number(id), name: `Facility ${id}` }));
                updatedData.facilities = parsedFacilities;
            }

            let currentImages = roomExists.images || [];

            let deletedImages = req.body['deleted_images[]'];
            if (deletedImages) {
                const deletedIds = Array.isArray(deletedImages) ? deletedImages.map(Number) : [Number(deletedImages)];
                currentImages = currentImages.filter(img => !deletedIds.includes(img.id));
            }

            updatedData.images = processUploadedFiles(req.files, currentImages);

            db.get('rooms').find({ id: roomId }).assign(updatedData).write();
            return res.status(200).json({ message: "Room data updated", data: updatedData });
        } catch (error) {
            console.error("Update Error:", error);
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    // --- DELETE ROOM ---
    const deleteMatch = req.path.match(/^\/(?:api\/)?admin\/delete\/(\d+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
        const roomId = parseInt(deleteMatch[1], 10);
        const room = db.get('rooms').find({ id: roomId }).value();

        if (!room) return res.status(404).json({ message: "Room not found" });

        try {
            db.get('rooms').remove({ id: roomId }).write();
            return res.status(200).json({ message: "Room data deleted" });
        } catch (error) {
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    next();
};