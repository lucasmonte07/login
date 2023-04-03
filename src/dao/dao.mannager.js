export const getMCart = async () => {
    const modelCart = process.env.SELECTDB == 1 ? await import('./models/MongoDB/Cart.js') :
        await import('./models/PostgreSQL/Cart.js')
    return modelCart
}

export const getMMessages = async () => {
    const modelMessage = process.env.SELECTDB == 1 ? await import('./models/MongoDB/Message.js') :
        await import('./models/PostgreSQL/Message.js')
    return modelMessage
}

export const getMProducts = async () => {
    const modelProduct = process.env.SELECTDB == 1 ? await import('./models/MongoDB/Producto.js') :
        await import('./models/PostgresSQL/Producto.js')
    return modelProduct
}