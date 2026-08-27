import RoleGate from '@/components/admin/RoleGate'
import SettingsEditor from '@/components/admin/SettingsEditor'
export default function Settings(){return <RoleGate allow={['admin']}><div className="admin-page"><div className="page-head"><div><span className="eyebrow">CẤU HÌNH HỆ THỐNG</span><h1>Thiết lập website</h1><p>Quản lý logo, hotline, banner, menu và SEO mà không cần sửa code.</p></div></div><SettingsEditor/></div></RoleGate>}
