import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {

const blogs=[

'beneficios-ducha-fria',

// ===== FUTUROS BLOGS =====

'dejar-procrastinacion',
// 'testosterona-natural',
// 'como-dejar-fumar',
// 'rutina-disciplina-manana',
// 'beneficios-dejar-porno',
// 'como-estudiar-sin-distracciones',
// 'habitos-que-destruyen-tu-disciplina',
// 'que-pasa-si-te-duchas-frio-30-dias',
// 'como-dejar-el-movil',
// 'rutina-para-mejorar-tu-vida'

];

return [

{
url:'https://www.mastesto.es',
lastModified:new Date(),
changeFrequency:'daily' as const,
priority:1
},

{
url:'https://www.mastesto.es/blog',
lastModified:new Date(),
changeFrequency:'daily' as const,
priority:0.95
},

...blogs.map((slug)=>({

url:`https://www.mastesto.es/blog/${slug}`,

lastModified:new Date(),

changeFrequency:'weekly' as const,

priority:0.85

}))

];

}
