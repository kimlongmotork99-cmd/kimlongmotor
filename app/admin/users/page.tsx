import RoleGate from '@/components/admin/RoleGate'
import UsersClient from './users-client'
export default function Users(){return <RoleGate allow={['admin']}><UsersClient/></RoleGate>}
