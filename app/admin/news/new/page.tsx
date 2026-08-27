import RoleGate from '@/components/admin/RoleGate'; import NewsEditor from '@/components/NewsEditor'
export default function NewNews(){return <RoleGate allow={['admin','editor']}><div className="admin-page"><div className="page-head"><div><span className="eyebrow">CONTENT</span><h1>Thêm tin tức</h1><p>Viết và xuất bản nội dung mới.</p></div></div><NewsEditor/></div></RoleGate>}
