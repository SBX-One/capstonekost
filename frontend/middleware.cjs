module.exports = (req, res, next) => {
    if (req.method === 'GET' && (req.path === '/api/admin/rooms' || req.path === '/rooms')) {
        const db = req.app.db;
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

    next();
};