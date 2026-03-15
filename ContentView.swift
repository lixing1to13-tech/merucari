import SwiftUI

struct ContentView: View {
    @State private var productPageUrl: String = ""
    @State private var username: String = ""
    @State private var password: String = ""
    @State private var quantity: Int = 1
    @State private var shippingAddress: String = ""
    @State private var message: String = ""
    @State private var isOrdering = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("煤炉商品页地址")) {
                    TextField("输入商品页 URL", text: $productPageUrl)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                }

                Section(header: Text("账户配置（用于下单）")) {
                    TextField("账户用户名", text: $username)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    SecureField("账户密码", text: $password)
                    Stepper(value: $quantity, in: 1...100) {
                        Text("数量: \(quantity)")
                    }
                    TextField("收货地址", text: $shippingAddress)
                }

                Section {
                    Button(action: placeOrder) {
                        HStack {
                            Spacer()
                            if isOrdering {
                                ProgressView()
                            }
                            Text(isOrdering ? "正在下单..." : "立即下单")
                                .bold()
                            Spacer()
                        }
                    }
                    .disabled(isOrdering || !canSubmit)
                }

                if !message.isEmpty {
                    Section(header: Text("结果")) {
                        Text(message)
                            .foregroundColor(message.contains("成功") ? .green : .red)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .navigationTitle("煤炉快速下单")
        }
    }

    private var canSubmit: Bool {
        !productPageUrl.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        && !username.isEmpty
        && !password.isEmpty
        && !shippingAddress.isEmpty
    }

    private func placeOrder() {
        message = ""
        isOrdering = true

        let config = OrderConfig(
            productPageUrl: productPageUrl.trimmingCharacters(in: .whitespacesAndNewlines),
            account: Account(username: username.trimmingCharacters(in: .whitespacesAndNewlines), password: password),
            quantity: quantity,
            shippingAddress: shippingAddress.trimmingCharacters(in: .whitespacesAndNewlines)
        )

        Task {
            do {
                let result = try await OrderService.shared.placeOrder(using: config)
                message = "下单成功：\(result.orderId)\n商品: \(result.productName)\n总价: ¥\(String(format: "%.2f", result.totalPrice))"
            } catch {
                message = "下单失败：\(error.localizedDescription)"
            }
            isOrdering = false
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
