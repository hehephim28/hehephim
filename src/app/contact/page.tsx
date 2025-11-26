import { Metadata } from 'next';
import { Layout } from '@/components/layout/Layout';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ | HeHePhim',
  description: 'Liên hệ với HeHePhim - Kênh phim trực tuyến chất lượng cao',
};

export default function ContactPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-gray-400 text-lg">
                Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp của bạn
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-red-500 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-red-600 rounded-lg p-3">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                    <p className="text-gray-400">hehephim28@gmail.com</p>
                    <p className="text-gray-400">support@hehephim.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-red-500 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-red-600 rounded-lg p-3">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Hotline</h3>
                    <p className="text-gray-400">1900-xxxx (8h - 22h hàng ngày)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Thông tin chung</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong className="text-white">HeHePhim</strong> là nền tảng xem phim trực tuyến
                  với kho phim phong phú, đa dạng thể loại, cập nhật liên tục phim mới nhất.
                </p>
                <p>
                  Chúng tôi cam kết mang đến trải nghiệm xem phim tốt nhất với chất lượng
                  hình ảnh cao, giao diện thân thiện và dễ sử dụng.
                </p>
                <p className="pt-4 border-t border-slate-700">
                  <strong className="text-white">Giờ làm việc:</strong> 24/7<br />
                  <strong className="text-white">Hỗ trợ khách hàng:</strong> 8h - 22h hàng ngày
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
