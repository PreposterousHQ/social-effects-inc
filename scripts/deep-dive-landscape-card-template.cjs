// Keep a wide article cover intact within the approved filmstrip B image frame.
const filmstrip=require('./deep-dive-card-template.cjs');
module.exports=s=>filmstrip(s).replace('</style>','.photo{object-fit:contain;background:#0d100d}</style>');
