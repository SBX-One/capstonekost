import jsonServer from 'json-server'
import auth from 'json-server-auth'
import multer from 'multer'
import customMiddleware from './middleware.cjs'

const app = jsonServer.create()
const router = jsonServer.router('db.json')

const upload = multer({ storage: multer.memoryStorage() })

app.db = router.db

app.use(jsonServer.rewriter({
    "/api/admin/rooms": "/rooms",
    "/api/admin/rooms/:id": "/rooms/:id",
    "/tenant/rooms": "/rooms",
    "/tenant/rooms/:id": "/rooms/:id",
    "/api/tenant/rooms": "/rooms",
    "/api/tenant/rooms/:id": "/rooms/:id"
}))

app.use(jsonServer.defaults())

app.use(upload.any())

app.use(customMiddleware)

app.use(auth)
app.use(router)

app.listen(8000, () => {
    console.log('🚀 Auth JSON Server is running on http://localhost:8000')
})