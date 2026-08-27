'use client'
import {useEffect,useState} from 'react'
import {supabaseBrowser} from '@/lib/supabase'
import Dropzone from './Dropzone'

type Banner={id:string,title:string,subtitle:string,image_url:string,mobile_image_url?:string,cta_label?:string,cta_url?:string,sort_order:number,status:string}
export default function BannerManager(){
 const [rows,setRows]=useState<Banner[]>([]); const [saving,setSaving]=useState(false); const [drag,setDrag]=useState<string|null>(null)
 const load=()=>supabaseBrowser().from('home_banners').select('*').order('sort_order').then(({data})=>setRows((data||[]) as Banner[])); useEffect(()=>{load()},[])
 const patch=(id:string,k:keyof Banner,v:any)=>setRows(rs=>rs.map(r=>r.id===id?{...r,[k]:v}:r))
 const add=async()=>{const {data,error}=await supabaseBrowser().from('home_banners').insert({title:'Banner mới',subtitle:'',image_url:'/assets/hero.jpg',sort_order:rows.length,status:'draft'}).select().single(); if(!error&&data)setRows([...rows,data as Banner])}
 const save=async()=>{setSaving(true);for(const [i,r] of rows.entries()) await supabaseBrowser().from('home_banners').update({...r,sort_order:i,updated_at:new Date().toISOString()}).eq('id',r.id);setSaving(false);load()}
 const del=async(id:string)=>{if(!confirm('Xóa banner này?'))return;await supabaseBrowser().from('home_banners').delete().eq('id',id);load()}
 const move=(from:number,to:number)=>{if(to<0||to>=rows.length)return;const x=[...rows];const [item]=x.splice(from,1);x.splice(to,0,item);setRows(x)}
 return <div className="panel"><div className="panel-title"><div><span className="eyebrow">HERO SLIDER</span><h2>Banner trang chủ</h2><p className="muted">Kéo từng slide để thay đổi thứ tự. Chỉ banner Xuất bản mới hiện trên website.</p></div><div className="head-actions"><button className="btn secondary" onClick={add}>+ Thêm slide</button><button className="btn primary" disabled={saving} onClick={save}>{saving?'Đang lưu…':'Lưu thứ tự & nội dung'}</button></div></div>
 <div className="banner-list">{rows.map((r,i)=><article key={r.id} draggable onDragStart={()=>setDrag(r.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>{const from=rows.findIndex(x=>x.id===drag);move(from,i);setDrag(null)}} className={drag===r.id?'banner-card dragging':'banner-card'}>
   <div className="banner-grip">☷<small>#{i+1}</small></div><div className="banner-image">{r.image_url?<img src={r.image_url} alt=""/>:<div className="hero-placeholder">Ảnh banner</div>}</div>
   <div className="banner-fields"><label>Tiêu đề<input value={r.title} onChange={e=>patch(r.id,'title',e.target.value)}/></label><label>Phụ đề<input value={r.subtitle||''} onChange={e=>patch(r.id,'subtitle',e.target.value)}/></label><div className="form-grid"><label>CTA<input value={r.cta_label||''} onChange={e=>patch(r.id,'cta_label',e.target.value)}/></label><label>Liên kết<input value={r.cta_url||''} onChange={e=>patch(r.id,'cta_url',e.target.value)}/></label></div><label>Ảnh desktop<input value={r.image_url} onChange={e=>patch(r.id,'image_url',e.target.value)}/></label><Dropzone onUploaded={url=>patch(r.id,'image_url',url)} label="Kéo ảnh banner vào đây"/></div>
   <div className="banner-side"><select value={r.status} onChange={e=>patch(r.id,'status',e.target.value)}><option value="draft">Nháp</option><option value="published">Xuất bản</option></select><button className="icon-btn danger" onClick={()=>del(r.id)}>×</button><div className="move-buttons"><button onClick={()=>move(i,i-1)}>↑</button><button onClick={()=>move(i,i+1)}>↓</button></div></div>
 </article>)}</div>{!rows.length&&<div className="admin-empty">Chưa có banner. Hãy thêm slide đầu tiên.</div>}</div>
}
