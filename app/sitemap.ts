import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {

const blogs=[

'beneficios-ducha-fria',
'dejar-procrastinacion',
'testosterona-natural'

];

return [

{
url:'https://mastesto.es',
lastModified:new Date(),
changeFrequency:'daily',
priority:1
},

{
url:'https://mastesto.es/blog',
lastModified:new Date(),
changeFrequency:'daily',
priority:0.9
},

...blogs.map((slug)=>({

url:`https://mastesto.es/blog/${slug}`,
lastModified:new Date(),
changeFrequency:'weekly',
priority:0.8

}))

]

}
