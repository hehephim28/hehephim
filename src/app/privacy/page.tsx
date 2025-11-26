import { Metadata } from 'next';
import { Layout } from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Chính sách bảo mật | HeHePhim',
    description: 'Chính sách bảo mật thông tin người dùng tại HeHePhim',
};

export default function PrivacyPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Chính sách bảo mật
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
                            </p>
                        </div>

                        {/* Privacy Content */}
                        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 space-y-6 text-gray-300">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Thông tin chúng tôi thu thập</h2>
                                <p className="mb-3">
                                    Khi bạn sử dụng HeHePhim, chúng tôi có thể thu thập các loại thông tin sau:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Thông tin cá nhân: tên, email, số điện thoại (nếu bạn đăng ký tài khoản)</li>
                                    <li>Thông tin sử dụng: lịch sử xem phim, tùy chọn, đánh giá</li>
                                    <li>Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, thiết bị</li>
                                    <li>Cookies và công nghệ tương tự để cải thiện trải nghiệm người dùng</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
                                <p className="mb-3">Thông tin của bạn được sử dụng để:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
                                    <li>Cá nhân hóa trải nghiệm người dùng</li>
                                    <li>Gửi thông báo về cập nhật, khuyến mãi (nếu bạn đồng ý)</li>
                                    <li>Phân tích và nghiên cứu để nâng cao chất lượng dịch vụ</li>
                                    <li>Bảo vệ an ninh và ngăn chặn gian lận</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Chia sẻ thông tin</h2>
                                <p>
                                    Chúng tôi không bán thông tin cá nhân của bạn. Thông tin có thể được chia sẻ với:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                                    <li>Đối tác cung cấp dịch vụ (hosting, phân tích, thanh toán)</li>
                                    <li>Các cơ quan pháp luật khi có yêu cầu hợp lệ</li>
                                    <li>Các bên liên quan trong trường hợp sáp nhập hoặc mua bán doanh nghiệp</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">4. Bảo mật thông tin</h2>
                                <p>
                                    Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin
                                    cá nhân của bạn khỏi truy cập trái phép, mất mát, hoặc lạm dụng. Tuy nhiên,
                                    không có phương thức truyền tải qua Internet nào là an toàn 100%.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
                                <p>
                                    Chúng tôi sử dụng cookies để lưu trữ tùy chọn của bạn và cải thiện trải nghiệm
                                    sử dụng. Bạn có thể tắt cookies trong trình duyệt của mình, nhưng điều này có
                                    thể ảnh hưởng đến một số tính năng của trang web.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">6. Quyền của bạn</h2>
                                <p className="mb-3">Bạn có quyền:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Truy cập và xem thông tin cá nhân của bạn</li>
                                    <li>Yêu cầu chỉnh sửa hoặc xóa thông tin</li>
                                    <li>Từ chối nhận thông tin marketing</li>
                                    <li>Rút lại sự đồng ý xử lý dữ liệu</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">7. Dịch vụ của bên thứ ba</h2>
                                <p>
                                    Trang web của chúng tôi có thể chứa liên kết đến các trang web của bên thứ ba.
                                    Chúng tôi không chịu trách nhiệm về chính sách bảo mật hoặc nội dung của các
                                    trang web này.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">8. Thay đổi chính sách</h2>
                                <p>
                                    Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ
                                    thông báo về bất kỳ thay đổi quan trọng nào bằng cách đăng chính sách mới trên
                                    trang này và cập nhật ngày "Cập nhật lần cuối".
                                </p>
                            </section>

                            <section className="pt-6 border-t border-slate-700">
                                <p className="text-sm text-gray-400">
                                    <strong className="text-white">Cập nhật lần cuối:</strong> Tháng 11, 2024
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ
                                    với chúng tôi tại: privacy@hehephim.com
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
