export type Role = 'admin' | 'editor' | 'sales'
export const roleLabels: Record<Role,string> = {admin:'Admin', editor:'Biên tập viên', sales:'Kinh doanh'}
export const roleCan = {
  admin: ['dashboard','products','news','media','settings','users','inquiries','bookings','warranties'],
  editor: ['dashboard','products','news','media','warranties'],
  sales: ['dashboard','products','inquiries','bookings']
} as const
