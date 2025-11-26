import { Metadata } from 'next';
import { Layout } from '@/components/layout/Layout';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Điều khoản sử dụng | HeHePhim',
    description: 'Điều khoản sử dụng dịch vụ HeHePhim',
};

export default function TermsPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Điều khoản sử dụng
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ
                            </p>
                        </div>

                        {/* Terms Content */}
                        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 space-y-6 text-gray-300">
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Chấp nhận điều khoản</h2>
                                <p>
                                    Bằng việc truy cập và sử dụng HeHePhim, bạn đồng ý tuân thủ các điều khoản và
                                    điều kiện được quy định dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào
                                    của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Sử dụng dịch vụ</h2>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Bạn phải từ đủ 13 tuổi trở lên để sử dụng dịch vụ này</li>
                                    <li>Bạn chịu trách nhiệm về tất cả hoạt động dưới tài khoản của mình</li>
                                    <li>Không được sao chép, phân phối lại nội dung mà không có sự cho phép</li>
                                    <li>Không được sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Nội dung</h2>
                                <p>
                                    Tất cả nội dung trên HeHePhim bao gồm văn bản, hình ảnh, video và các tài liệu
                                    khác đều thuộc quyền sở hữu của chúng tôi hoặc các bên cấp phép. Việc sử dụng
                                    trái phép có thể vi phạm luật bản quyền và các luật liên quan.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">4. Trách nhiệm của người dùng</h2>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Duy trì bảo mật thông tin đăng nhập của bạn</li>
                                    <li>Thông báo ngay cho chúng tôi về bất kỳ vi phạm bảo mật nào</li>
                                    <li>Không can thiệp hoặc phá hoại hệ thống của chúng tôi</li>
                                    <li>Tuân thủ tất cả các luật và quy định hiện hành</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">5. Giới hạn trách nhiệm</h2>
                                <p>
                                    HeHePhim không chịu trách nhiệm về bất kỳ thithiệt hại trực tiếp, gián tiếp,
                                    ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không
                                    thể sử dụng dịch vụ của chúng tôi.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">6. Thay đổi điều khoản</h2>
                                <p>
                                    Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Những thay đổi
                                    sẽ có hiệu lực ngay khi được đăng tải trên trang web. Việc tiếp tục sử dụng
                                    dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                                </p>
                            </section>

                            <section className="pt-6 border-t border-slate-700">
                                <p className="text-sm text-gray-400">
                                    <strong className="text-white">Cập nhật lần cuối:</strong> Tháng 11, 2024
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với
                                    chúng tôi tại: hehephim28@gmail.com
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
