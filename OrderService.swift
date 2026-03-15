import Foundation

struct Account {
    let username: String
    let password: String
}

struct OrderConfig {
    let productPageUrl: String
    let account: Account
    let quantity: Int
    let shippingAddress: String
}

struct OrderResult {
    let orderId: String
    let productName: String
    let totalPrice: Double
}

enum OrderError: LocalizedError {
    case invalidUrl
    case loginFailed
    case parseFailed
    case checkoutFailed(String)

    var errorDescription: String? {
        switch self {
        case .invalidUrl:
            return "商品页地址无效，请确认是完整 URL。"
        case .loginFailed:
            return "账号登录失败，请检查用户名和密码。"
        case .parseFailed:
            return "解析商品信息失败，当前仅支持标准商品页面。"
        case .checkoutFailed(let reason):
            return "下单失败：\(reason)"
        }
    }
}

final class OrderService {
    static let shared = OrderService()
    private init() {}

    func placeOrder(using config: OrderConfig) async throws -> OrderResult {
        guard let url = URL(string: config.productPageUrl), url.host != nil else {
            throw OrderError.invalidUrl
        }

        // 1) 登录（这里是模拟示例，后续接入真实 API）
        let loggedIn = try await login(username: config.account.username, password: config.account.password)
        guard loggedIn else { throw OrderError.loginFailed }

        // 2) 读取商品页并解析信息（示例里我们只做模拟）
        let parsed = try await fetchProductInfo(url: url)

        // 3) 提交下单（真实接口请替换此处）
        let checkout = try await checkout(productId: parsed.id, qty: config.quantity, address: config.shippingAddress)

        return OrderResult(orderId: checkout.orderId, productName: parsed.name, totalPrice: checkout.totalPrice)
    }

    private func login(username: String, password: String) async throws -> Bool {
        try await Task.sleep(nanoseconds: 300_000_000)
        return !username.isEmpty && !password.isEmpty
    }

    private func fetchProductInfo(url: URL) async throws -> (id: String, name: String, price: Double) {
        try await Task.sleep(nanoseconds: 300_000_000)

        // NOTE: 这里示例直接用 URL 里 hostname 作为商品名，实际应调用 API 或解析页面
        let sampleName = "煤炉商品"
        return (id: "SAMPLE_PRODUCT_001", name: sampleName, price: 1280.0)
    }

    private func checkout(productId: String, qty: Int, address: String) async throws -> (orderId: String, totalPrice: Double) {
        try await Task.sleep(nanoseconds: 400_000_000)

        if productId.isEmpty || qty <= 0 {
            throw OrderError.checkoutFailed("商品 ID 或数量无效")
        }

        let total = Double(qty) * 1280.0
        return (orderId: "ORDER-\(Int(Date().timeIntervalSince1970))", totalPrice: total)
    }
}
