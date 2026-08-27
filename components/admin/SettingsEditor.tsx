'use client'
import {useEffect,useState} from 'react'
import {supabaseBrowser} from '@/lib/supabase'
import Dropzone from './Dropzone'

export default function SettingsEditor(){
 const [data,setData]=useState<any>({}); const [saving,setSaving]=useState(false)
 useEffect(()=>{supabaseBrowser().from('site_settings').select('key,value').then(({data})=>{const x:any={};data?.forEach(r=>x[r.key]=r.value);setData(x)})},[])
 const save=async(key:string,value:any)=>{setSaving(true);await supabaseBrowser().from('site_settings').upsert({key,value,updated_at:new Date().toISOString()});setData((d:any)=>({...d,[key]:value}));setSaving(false)}
 const setField=(key:string,field:string,value:string)=>setData((d:any)=>({...d,[key]:{...(d[key]||{}),[field]:value}}))
 const setMenu=(items:any[])=>setData((d:any)=>({...d,menu:{...(d.menu||{}),items}}))
 return <div className="settings-grid">
  <section className="panel"><div className="panel-title"><div><span className="eyebrow">THƯƠNG HIỆU</span><h2>Logo & hotline</h2></div><button className="btn" disabled={saving} onClick={()=>save('brand',data.brand)}>Lưu</button></div>
   <label>Tên thương hiệu<input value={data.brand?.name||''} onChange={e=>setField('brand','name',e.target.value)}/></label>
   <label>Logo URL<input value={data.brand?.logo||''} onChange={e=>setField('brand','logo',e.target.value)} placeholder="https://…"/></label>
   <Dropzone onUploaded={url=>setData((d:any)=>({...d,brand:{...(d.brand||{}),logo:url}}))} label="Kéo logo vào đây"/>
   <label>Favicon URL<input value={data.brand?.favicon||''} onChange={e=>setField('brand','favicon',e.target.value)}/></label>
   <div className="panel-actions"><button className="btn secondary" onClick={()=>save('contact',data.contact)}>Lưu hotline & liên hệ</button></div>
   <label>Hotline<input value={data.contact?.hotline||''} onChange={e=>setField('contact','hotline',e.target.value)}/></label>
   <label>Email<input value={data.contact?.email||''} onChange={e=>setField('contact','email',e.target.value)}/></label>
  </section>
  <section className="panel"><div className="panel-title"><div><span className="eyebrow">SEO</span><h2>Google & chia sẻ</h2></div><button className="btn" onClick={()=>save('seo',data.seo)}>Lưu</button></div>
   <label>SEO title<input value={data.seo?.title||''} onChange={e=>setField('seo','title',e.target.value)}/></label>
   <label>Mô tả<textarea value={data.seo?.description||''} onChange={e=>setField('seo','description',e.target.value)}/></label>
   <label>Từ khóa<input value={data.seo?.keywords||''} onChange={e=>setField('seo','keywords',e.target.value)}/></label>
  </section>
  <section className="panel"><div className="panel-title"><div><span className="eyebrow">TRANG CHỦ</span><h2>Banner Hero</h2></div><button className="btn" onClick={()=>save('homepage',data.homepage)}>Lưu</button></div>
   <label>Tiêu đề<input value={data.homepage?.heroTitle||''} onChange={e=>setField('homepage','heroTitle',e.target.value)}/></label>
   <label>Phụ đề<input value={data.homepage?.heroSubtitle||''} onChange={e=>setField('homepage','heroSubtitle',e.target.value)}/></label>
   <label>Ảnh banner URL<input value={data.homepage?.heroImage||''} onChange={e=>setField('homepage','heroImage',e.target.value)}/></label>
   <label>Nút CTA<input value={data.homepage?.heroCta||''} onChange={e=>setField('homepage','heroCta',e.target.value)}/></label>
  </section>
  <section className="panel"><div className="panel-title"><div><span className="eyebrow">ĐIỀU HƯỚNG</span><h2>Menu website</h2></div><button className="btn" onClick={()=>save('menu',data.menu)}>Lưu</button></div>
   {(data.menu?.items||[]).map((it:any,i:number)=><div className="menu-edit" key={i}>
    <input value={it.label||''} onChange={e=>{const items=[...(data.menu?.items||[])];items[i]={...items[i],label:e.target.value};setMenu(items)}}/>
    <input value={it.href||''} onChange={e=>{const items=[...(data.menu?.items||[])];items[i]={...items[i],href:e.target.value};setMenu(items)}}/>
    <button className="icon-btn" onClick={()=>setMenu((data.menu?.items||[]).filter((_:any,n:number)=>n!==i))}>×</button>
   </div>)}
   <button className="btn secondary" onClick={()=>setMenu([...(data.menu?.items||[]),{label:'Mục mới',href:'/'}])}>+ Thêm mục menu</button>
  </section>
 </div>
}
