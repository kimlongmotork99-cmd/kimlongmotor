'use client'
import {useEffect,useState} from 'react'
import {supabaseBrowser} from '@/lib/supabase'
import {Role} from '@/lib/admin'
export default function RoleGate({allow,children}:{allow:Role[];children:React.ReactNode}){const [role,setRole]=useState<Role|null>(null);const [loading,setLoading]=useState(true);useEffect(()=>{supabaseBrowser().from('user_profiles').select('role').single().then(({data})=>{setRole((data?.role as Role)||null);setLoading(false)})},[]);if(loading)return <div className="admin-loading">Đang kiểm tra quyền…</div>;if(!role||!allow.includes(role))return <div className="admin-empty"><b>Không có quyền truy cập</b><p>Vai trò hiện tại không được phép thực hiện chức năng này.</p></div>;return <>{children}</>}
