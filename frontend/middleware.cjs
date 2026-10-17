const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
    const db = req.app.db;

    // 1. GET /api/admin/rooms (INDEX) & GET /rooms
    if (req.method === 'GET' && (req.path === '/api/admin/rooms' || req.path === '/rooms')) {
        let rooms = db.get('rooms').value() || [];
        const query = req.query;

        if (query.search) {
            const keyword = query.search.toLowerCase();
            rooms = rooms.filter(r =>
                (r.name && r.name.toLowerCase().includes(keyword)) ||
                (r.description && r.description.toLowerCase().includes(keyword))
            );
        }
        if (query.status) {
            rooms = rooms.filter(r => r.status === query.status);
        }
        if (query.floor) {
            rooms = rooms.filter(r => String(r.floor) === String(query.floor));
        }
        if (query.room_type) {
            rooms = rooms.filter(r =>
                String(r.room_type?.id) === String(query.room_type) ||
                String(r.room_type?.name).toLowerCase().includes(query.room_type.toLowerCase())
            );
        }
        if (query.min_price) {
            const min = Number(query.min_price);
            rooms = rooms.filter(r => r.price >= min);
        }
        if (query.max_price) {
            const max = Number(query.max_price);
            rooms = rooms.filter(r => r.price <= max);
        }

        const total = rooms.length;
        const page = parseInt(query.page || query._page, 10) || 1;
        const limit = parseInt(query.per_page || query._limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRooms = rooms.slice(startIndex, endIndex);

        return res.json({
            message: "Successfully fetched data",
            data: paginatedRooms,
            meta: {
                current_page: page,
                per_page: limit,
                total: total,
                last_page: Math.ceil(total / limit) || 1
            }
        });
    }

    // 2. POST /api/admin/create (CREATE ROOM)
    if (req.method === 'POST' && (req.path === '/api/admin/create' || req.path === '/admin/create')) {
        try {
            const rooms = db.get('rooms').value() || [];

            const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;

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
                description: req.body.description,
                rules: req.body.rules,
                images: [
                    { id: 1, image_path: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80", sort_order: 1 }
                ],
                facilities: Array.isArray(req.body['facilities[]'])
                    ? req.body['facilities[]'].map(id => ({ id: Number(id), name: `Facility ${id}` }))
                    : Array.isArray(req.body.facilities)
                        ? req.body.facilities.map(id => ({ id: Number(id), name: `Facility ${id}` }))
                        : [],
                utilities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            db.get('rooms').push(newRoom).write();

            return res.status(201).json({
                message: "Room data created",
                data: newRoom
            });

        } catch (error) {
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    // 3. PATCH /api/admin/update/:id (UPDATE ROOM)
    const updateMatch = req.path.match(/^\/(?:api\/)?admin\/update\/(\d+)$/);
    if (req.method === 'PATCH' && updateMatch) {
        const roomId = parseInt(updateMatch[1], 10);
        const roomExists = db.get('rooms').find({ id: roomId }).value();

        if (!roomExists) {
            return res.status(404).json({ message: "Room not found" });
        }

        try {
            const updatedData = {
                ...roomExists,
                name: req.body.name || roomExists.name,
                floor: req.body.floor ? Number(req.body.floor) : roomExists.floor,
                price: req.body.price ? Number(req.body.price) : roomExists.price,
                status: req.body.status || roomExists.status,
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

            const fasilitasInput = req.body['facilities[]'] || req.body.facilities;
            if (fasilitasInput) {
                updatedData.facilities = Array.isArray(fasilitasInput)
                    ? fasilitasInput.map(id => ({ id: Number(id), name: `Facility ${id}` }))
                    : [{ id: Number(fasilitasInput), name: `Facility ${fasilitasInput}` }];
            }

            db.get('rooms').find({ id: roomId }).assign(updatedData).write();

            return res.status(200).json({
                message: "Room data updated",
                data: updatedData
            });

        } catch (error) {
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    // 4. DELETE /api/admin/delete/:id (DELETE ROOM)
    const deleteMatch = req.path.match(/^\/(?:api\/)?admin\/delete\/(\d+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
        const roomId = parseInt(deleteMatch[1], 10);
        const room = db.get('rooms').find({ id: roomId }).value();

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        try {
            db.get('rooms').remove({ id: roomId }).write();

            return res.status(200).json({
                message: "Room data deleted"
            });
        } catch (error) {
            return res.status(500).json({ message: "An unexpected error occurred" });
        }
    }

    next();
};