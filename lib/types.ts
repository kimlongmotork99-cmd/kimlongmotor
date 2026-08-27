export type Product = {
  id:string; slug:string; name:string; category:string; tagline:string|null; description:string|null; price:number|null; price_label:string|null; featured:boolean; status:'draft'|'published'; hero_image:string|null; gallery:string[]; specs:{label:string;value:string}[]; catalogue_url:string|null; created_at:string; updated_at:string
}
export type News = { id:string; slug:string; title:string; excerpt:string|null; content:string; cover_image:string|null; category:string|null; published_at:string|null; status:'draft'|'published'; featured:boolean; created_at:string }
