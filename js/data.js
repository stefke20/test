// Pintje — game data: beers, rarities, glasses, themes, seasons, buildings, skills, achievements.
'use strict';

// =====================================================================
// RARITIES & BEERS
// =====================================================================
// weight = chance (%), pts = leaderboard points, xp, secs = bonus of that many seconds of staff income when YOU finish it
const RARITIES = [
  { label: 'Gewoon',       weight: 46.099, pts: 1,       xp: 10,     secs: 0.5 },
  { label: 'Ongewoon',     weight: 24,     pts: 3,       xp: 25,     secs: 1 },
  { label: 'Zeldzaam',     weight: 13,     pts: 10,      xp: 60,     secs: 3 },
  { label: 'Episch',       weight: 7,      pts: 40,      xp: 150,    secs: 8 },
  { label: 'Legendarisch', weight: 4,      pts: 250,     xp: 400,    secs: 20 },
  { label: 'Parel',        weight: 2.2,    pts: 500,     xp: 700,    secs: 40,    halo: '#f4ead8', pal: ['#f4ead8', '#fffaf0', '#d8c8a8'] },
  { label: 'Smaragd',      weight: 1.4,    pts: 800,     xp: 1000,   secs: 60,    halo: '#3ddc84', pal: ['#3ddc84', '#b8ffd6', '#0f8f4f'] },
  { label: 'Robijn',       weight: 0.9,    pts: 1500,    xp: 1500,   secs: 90,    halo: '#ff4d6d', pal: ['#ff4d6d', '#ffc2cc', '#a3102e'] },
  { label: 'Saffier',      weight: 0.55,   pts: 3000,    xp: 2200,   secs: 150,   halo: '#5b8cff', pal: ['#5b8cff', '#cfdcff', '#1b3f80'] },
  { label: 'Amethist',     weight: 0.35,   pts: 5000,    xp: 3000,   secs: 240,   halo: '#b56cff', pal: ['#b56cff', '#e6ccff', '#5a1f8a'] },
  { label: 'Diamant',      weight: 0.22,   pts: 10000,   xp: 4000,   secs: 360,   halo: '#d9f6ff', pal: ['#ffffff', '#d9f6ff', '#9fe3ff'] },
  { label: 'Obsidiaan',    weight: 0.14,   pts: 20000,   xp: 6000,   secs: 600,   halo: '#9d85ff', pal: ['#2b2340', '#9d85ff', '#0a0a10', '#ffffff'] },
  { label: 'Regenboog',    weight: 0.08,   pts: 40000,   xp: 9000,   secs: 900,   halo: '#fff35c', pal: ['#ff5f5f', '#ffb347', '#fff35c', '#5fff8a', '#5fc8ff', '#b05fff'] },
  { label: 'Kosmisch',     weight: 0.05,   pts: 80000,   xp: 15000,  secs: 1500,  halo: '#7af0ff', pal: ['#7af0ff', '#b05fff', '#ffffff', '#2a1a6a'] },
  { label: 'Mythisch',     weight: 0.01,   pts: 150000,  xp: 40000,  secs: 3000,  halo: '#ffd75e', pal: ['#ffd75e', '#fff1a8', '#e0a800', '#ffffff'] },
  { label: 'Goddelijk',    weight: 0.001,  pts: 1000000, xp: 150000, secs: 10000, halo: '#ffffff', pal: ['#ffffff', '#fff7d6', '#ffd75e', '#fffbe0'] },
];
const GEM = 5, RAINBOW = 12, COSMIC = 13, MYTHIC = 14, DIVINE = 15;

// [id, name, tier, abv, style, top, bottom, foam, types]
// types: P pils · A amber/ale · B blond/tripel · D donker · W wit · T trappist · M paterbier · L lambiek · R Vlaams rood · F fruit · X fantasie
const RAW = [
  ['jupiler', 'Jupiler', 0, 5.2, 'pils', '#f6c445', '#dc9417', '#fffaf0', 'P'],
  ['stella', 'Stella Artois', 0, 5.2, 'pils', '#f3c94e', '#d99a1c', '#fffaf0', 'P'],
  ['maes', 'Maes', 0, 5.2, 'pils', '#f5c84a', '#d79318', '#fffaf0', 'P'],
  ['primus', 'Primus', 0, 5.2, 'pils', '#f2be40', '#d08912', '#fffaf0', 'P'],
  ['cristal', 'Cristal', 0, 5.0, 'pils', '#f8d360', '#e2a524', '#fffaf0', 'P'],
  ['lamot', 'Lamot Pils', 0, 5.0, 'pils', '#f4c950', '#da9a1d', '#fffaf0', 'P'],
  ['bavik', 'Bavik Premium Pils', 0, 5.2, 'pils', '#f5cd52', '#dc9c1e', '#fffaf0', 'P'],
  ['martens', 'Martens Pils', 0, 5.0, 'pils', '#f7d35c', '#e0a426', '#fffaf0', 'P'],
  ['jupiler00', 'Jupiler 0,0', 0, 0.0, 'alcoholvrije pils', '#f7d468', '#e3aa30', '#ffffff', 'P'],
  ['palm', 'Palm', 0, 5.2, 'Belgische amber', '#e39a3b', '#a95e17', '#fff4e0', 'A'],
  ['koninck', 'De Koninck', 0, 5.2, 'Antwerpse amber, uit een bolleke', '#d9862f', '#984f12', '#fff1dc', 'A'],
  ['ginder', 'Ginder Ale', 0, 5.1, 'Belgische ale', '#d98c35', '#9a5615', '#fff1dc', 'A'],
  ['opale', 'Op-Ale', 0, 5.0, 'Belgische ale', '#dc9238', '#a05a16', '#fff1dc', 'A'],
  ['horseale', 'Horse Ale', 0, 5.0, 'Belgische ale', '#d47f2c', '#8f4b10', '#fff0d8', 'A'],
  ['duvel', 'Duvel', 1, 8.5, 'sterk blond', '#f9d978', '#e8b23a', '#ffffff', 'B'],
  ['leffe', 'Leffe Blond', 1, 6.6, 'abdijbier', '#f0b232', '#c97a0e', '#fff6e6', 'B'],
  ['leffebruin', 'Leffe Bruin', 1, 6.5, 'abdijbier', '#6a2a12', '#2f1006', '#ead2a8', 'D'],
  ['hoegaarden', 'Hoegaarden', 1, 4.9, 'witbier', '#f8e7b0', '#ecd28a', '#ffffff', 'W'],
  ['kwak', 'Pauwel Kwak', 1, 8.4, 'amber', '#d9822b', '#9c4a10', '#f5e6c8', 'A'],
  ['omer', 'Omer', 1, 8.0, 'sterk blond', '#f7cf5a', '#e0a020', '#ffffff', 'B'],
  ['vedett', 'Vedett Extra Blond', 1, 5.2, 'pils', '#f8dc70', '#e6b236', '#ffffff', 'P'],
  ['grimbergen', 'Grimbergen Dubbel', 1, 6.5, 'abdijdubbel', '#6e2c12', '#331306', '#ead2a8', 'D'],
  ['affligem', 'Affligem Blond', 1, 6.7, 'abdijbier', '#f2bc45', '#d38e1d', '#fff6e6', 'B'],
  ['tongerlo', 'Tongerlo Blond', 1, 6.0, 'abdijbier', '#f1b843', '#d18a1b', '#fff6e6', 'B'],
  ['chouffe', 'La Chouffe', 1, 8.0, 'sterk blond', '#f2b247', '#cf8320', '#fff8ec', 'B'],
  ['zot', 'Brugse Zot', 1, 6.0, 'blond', '#f4c552', '#d89a24', '#ffffff', 'B'],
  ['zotdubbel', 'Brugse Zot Dubbel', 1, 7.5, 'dubbel', '#5e2410', '#2a0d04', '#e8cfa4', 'D'],
  ['kasteelrouge', 'Kasteel Rouge', 1, 8.0, 'kriekenbier', '#9c1f2e', '#5a0d18', '#f7d4d8', 'F'],
  ['kasteeldonker', 'Kasteel Donker', 1, 11.0, 'quadrupel', '#4e1e0c', '#200b03', '#e0c495', 'D'],
  ['delirium', 'Delirium Tremens', 1, 8.5, 'sterk blond', '#f6d36a', '#e3a92c', '#ffffff', 'B'],
  ['fruitesse', 'Liefmans Fruitesse', 1, 3.8, 'fruitbier', '#c2263b', '#7a1020', '#f9d6dc', 'F'],
  ['mortsubite', 'Mort Subite Kriek', 1, 4.0, 'kriek', '#b3203a', '#6a0f1f', '#f6c9d2', 'LF'],
  ['lindemanskriek', 'Lindemans Kriek', 1, 3.5, 'kriek', '#b81c38', '#6c0c1d', '#f8cad3', 'LF'],
  ['gordon', 'Gordon Finest Scotch', 1, 8.6, 'scotch ale', '#8a3a14', '#451a06', '#ecd3a8', 'A'],
  ['westmalle', 'Westmalle Tripel', 2, 9.5, 'trappist', '#f4c24a', '#d9961a', '#fff8ea', 'TB'],
  ['westmalled', 'Westmalle Dubbel', 2, 7.0, 'trappist', '#6a2a10', '#2f1006', '#ead2a8', 'TD'],
  ['orval', 'Orval', 2, 6.2, 'trappist', '#f0a03a', '#c86f17', '#fbf1dc', 'T'],
  ['chimay', 'Chimay Blauw', 2, 9.0, 'trappist', '#7b3a1b', '#3b170a', '#e9d3ad', 'TD'],
  ['chimayrood', 'Chimay Rood', 2, 7.0, 'trappist', '#8a3a1a', '#43170a', '#eed6b0', 'TD'],
  ['chimaywit', 'Chimay Wit', 2, 8.0, 'trappist', '#f0b84a', '#d08c1e', '#fff6e6', 'TB'],
  ['rochefort8', 'Rochefort 8', 2, 9.2, 'trappist', '#652a10', '#2c1005', '#e6cda4', 'TD'],
  ['rodenbach', 'Rodenbach Grand Cru', 2, 6.0, 'Vlaams rood', '#a8351f', '#5c160c', '#f2d9b8', 'R'],
  ['duchesse', 'Duchesse de Bourgogne', 2, 6.2, 'Vlaams rood', '#8a2a17', '#4a120a', '#f0d6b4', 'R'],
  ['petrus', 'Petrus Aged Pale', 2, 7.3, 'gerijpt op foeder', '#e8b04a', '#c4842a', '#fff3d6', 'R'],
  ['karmeliet', 'Tripel Karmeliet', 2, 8.4, 'tripel', '#f6cf55', '#dfa224', '#ffffff', 'B'],
  ['guldendraak', 'Gulden Draak', 2, 10.5, 'donker tripel', '#7a3414', '#3a1607', '#ecd3a8', 'D'],
  ['straffe', 'Straffe Hendrik Quadrupel', 2, 11.0, 'quadrupel', '#5c2510', '#280e04', '#e6cda4', 'D'],
  ['dupont', 'Saison Dupont', 2, 6.5, 'saison', '#f2c35a', '#d69a2a', '#ffffff', 'B'],
  ['boonkriek', 'Boon Oude Kriek', 2, 6.5, 'oude kriek', '#a8162f', '#5f0a1a', '#f6c9d2', 'LF'],
  ['cuveerene', 'Lindemans Cuvée René', 2, 5.5, 'oude geuze', '#f2bc4f', '#d39428', '#fff3d6', 'L'],
  ['westvleteren', 'Westvleteren 12', 3, 10.2, 'trappist', '#7a3b16', '#3a1806', '#ead2a8', 'TD'],
  ['wv8', 'Westvleteren 8', 3, 8.0, 'trappist', '#6a2f12', '#2e1306', '#e8cfa4', 'TD'],
  ['wvblond', 'Westvleteren Blond', 3, 5.8, 'trappist', '#f3c450', '#d79622', '#fff8ea', 'TB'],
  ['rochefort', 'Rochefort 10', 3, 11.3, 'trappist', '#5e2a12', '#2a0f05', '#e2c79c', 'TD'],
  ['rochefort6', 'Rochefort 6', 3, 7.5, 'trappist', '#7a3416', '#381406', '#e6cda4', 'TD'],
  ['bernardus', 'St. Bernardus Abt 12', 3, 10.0, 'quadrupel', '#6b3015', '#2f1207', '#e6cda4', 'D'],
  ['kasteelcuvee', 'Kasteel Cuvée du Château', 3, 11.0, 'gerijpte quadrupel', '#5a2610', '#250d04', '#e0c495', 'D'],
  ['pannepot', 'De Struise Pannepot', 3, 10.0, 'Vlaamse quadrupel', '#3e1a0c', '#170803', '#d9bb8c', 'D'],
  ['hanssens', 'Hanssens Oude Gueuze', 3, 6.0, 'oude geuze', '#f0b442', '#cf8a23', '#fff3d6', 'L'],
  ['ranke', 'De Ranke XX Bitter', 3, 6.2, 'hoppig blond', '#f2c55a', '#d69a2a', '#ffffff', 'B'],
  ['cantillon', 'Cantillon Gueuze', 4, 5.5, 'oude geuze', '#f4c14f', '#d9932a', '#fff6e0', 'L'],
  ['fonteinen', '3 Fonteinen Oude Geuze', 4, 6.0, 'oude geuze', '#f0b545', '#cf8622', '#fff3d6', 'L'],
  ['cantillonkriek', 'Cantillon Kriek', 4, 5.5, 'lambiek met krieken', '#a3172f', '#5d0a1a', '#f6c9d2', 'LF'],
  ['oudbeersel', 'Oud Beersel Oude Geuze', 4, 6.0, 'oude geuze', '#f0b442', '#cf8a23', '#fff3d6', 'L'],
  ['tilquin', 'Tilquin Oude Gueuze', 4, 7.0, 'oude geuze', '#f2bc4f', '#d39428', '#fff3d6', 'L'],
  ['girardin', 'Girardin Gueuze 1882', 4, 5.0, 'oude geuze', '#f1b84a', '#d08f27', '#fff3d6', 'L'],
  ['rosegambrinus', 'Cantillon Rosé de Gambrinus', 4, 5.0, 'lambiek met frambozen', '#d0284a', '#7e0f26', '#fbd3dc', 'LF'],
  ['decam', 'De Cam Oude Lambiek', 4, 5.0, 'jonge en oude lambiek', '#efb446', '#cc8a22', '#fff3d6', 'L'],
  ['westmalleextra', 'Westmalle Extra', 5, 4.8, 'paterbier, enkel voor de monniken', '#f6d272', '#e0a838', '#ffffff', 'TM'],
  ['chimaydoree', 'Chimay Dorée', 5, 4.8, 'paterbier van de abdij', '#f2be55', '#d39830', '#ffffff', 'TM'],
  ['rocheforttriple', 'Rochefort Triple Extra', 5, 8.1, 'trappist, zelden te krijgen', '#f3c757', '#d69d2a', '#fff8ea', 'TM'],
  ['blackdamnation', 'De Struise Black Damnation', 5, 13.0, 'imperial stout', '#1c0c06', '#050201', '#c9a77a', 'D'],
  ['petiteorval', 'Petite Orval', 6, 4.5, 'paterbier, enkel aan de abdij', '#f2b552', '#d58b2c', '#fbf1dc', 'TM'],
  ['rbvintage', 'Rodenbach Vintage', 6, 7.0, 'Vlaams rood, één jaargang', '#8e2a18', '#4f120a', '#f0d6b4', 'R'],
  ['stillenacht', 'De Dolle Stille Nacht Reserva', 6, 12.0, 'kerstbier op vat', '#d8892e', '#99551a', '#fbe8c8', 'B'],
  ['duvelba', 'Duvel Barrel Aged', 6, 11.5, 'op bourbonvat', '#e3a23e', '#a8661c', '#fff3dc', 'B'],
  ['loupepe', 'Cantillon Lou Pepe Kriek', 7, 5.0, 'lambiek met krieken', '#b0122e', '#62081a', '#f8c6d0', 'LF'],
  ['intensrood', '3 Fonteinen Intens Rood', 7, 6.0, 'lambiek met krieken', '#9e0f2a', '#560614', '#f8c6d0', 'LF'],
  ['alexander', 'Rodenbach Alexander', 7, 5.6, 'Vlaams rood met krieken', '#a3241f', '#5c100c', '#f4cdc4', 'RF'],
  ['oudbeitje', 'Hanssens Oudbeitje', 7, 6.0, 'lambiek met aardbeien', '#d2364e', '#851325', '#fbd3dc', 'LF'],
  ['blabaer', 'Cantillon Blåbær Lambik', 8, 5.0, 'lambiek met bosbessen', '#5a2a7a', '#2a1240', '#e6d4f2', 'LF'],
  ['blauwemaandag', 'Blauwe Maandag Tripel', 8, 9.0, 'fantasiebier van café De Kater', '#3a7bd5', '#1b3f80', '#e0ecff', 'X'],
  ['chimaygr', 'Chimay Grande Réserve 2008', 8, 9.0, 'gerijpte trappist', '#6a2c14', '#2c1106', '#e6cda4', 'TD'],
  ['mure', "Mûre Tilquin à l'ancienne", 8, 6.4, 'geuze met bramen', '#4a1a3a', '#22081a', '#e8cfe0', 'LF'],
  ['vigneronne', 'Cantillon Vigneronne', 9, 5.0, 'lambiek met druiven', '#e9c46a', '#b88a30', '#fff6e0', 'LF'],
  ['goldenblend', '3 Fonteinen Golden Blend', 9, 6.0, 'oude geuze met vierjarige lambiek', '#f4c64e', '#d89c24', '#fff6e0', 'L'],
  ['paarsepaters', 'Paarse Paters Elixir', 9, 9.9, 'fantasiebier uit een verdwenen abdij', '#7a3ab8', '#3a1060', '#ecd8ff', 'X'],
  ['wvbrick', "Westvleteren 12 'Brick' (2012)", 10, 10.2, 'trappist, eenmalige uitgave', '#6b3013', '#2d1206', '#ead2a8', 'TD'],
  ['zwanze', 'Cantillon Zwanze', 10, 5.0, 'lambiek, één dag per jaar', '#e8b04a', '#c4842a', '#fff3d6', 'L'],
  ['armand4', "3 Fonteinen Armand'4", 10, 6.0, 'oude geuze, seizoensreeks', '#efb447', '#cc8a22', '#fff3d6', 'L'],
  ['mochabomb', 'De Struise Black Damnation Mocha Bomb', 11, 13.0, 'imperial stout met koffie', '#120804', '#020100', '#b8946a', 'D'],
  ['stillenacht87', 'De Dolle Stille Nacht 1987', 11, 12.0, 'fantasie-jaargang uit de kelder', '#c97a28', '#7a4410', '#f5dcb4', 'X'],
  ['rochefort71', 'Rochefort 10 Kelderreserve 1971', 11, 11.3, 'fantasie-jaargang', '#4a1e0c', '#1a0803', '#d9bb8c', 'X'],
  ['kabouter', 'Kabouterbier Regenboog', 12, 7.7, 'fantasiebier, gebrouwen onder de regenboog', '#ff5f5f', '#5fc8ff', '#ffffff', 'X'],
  ['prisma', 'Prisma Lambiek', 12, 6.6, 'fantasielambiek', '#b05fff', '#fff35c', '#ffffff', 'X'],
  ['arcenciel', 'Kermiskriek Arc-en-ciel', 12, 5.5, 'fantasiekriek van de foor', '#ff5fa2', '#5fff8a', '#ffffff', 'X'],
  ['sterrenstof', 'Sterrenstof Stout', 13, 10.5, 'fantasiebier, gerijpt op een meteoriet', '#1a1040', '#04020c', '#c8c0ff', 'X'],
  ['bigbang', 'Big Bang Tripel', 13, 9.0, 'fantasietripel van voor de tijd', '#7af0ff', '#2a1a6a', '#ffffff', 'X'],
  ['arnoldus', 'Het Gouden Pintje van Sint-Arnoldus', 14, null, 'gebrouwen door de patroonheilige zelf', '#fff1a8', '#e0a800', '#fffbe0', 'X'],
  ['ambiorix', "Ambiorix' Laatste Vat", 14, null, 'Gallisch gerstenbier, 2.000 jaar gerijpt', '#c99a4a', '#5a3a12', '#f5e2bc', 'X'],
  ['mannekenpis', "Manneken Pis' Eigen Brouwsel", 14, 4.2, 'vers van de bron', '#fbe27a', '#e6b836', '#ffffff', 'X'],
  ['gambrinus', 'Het Eerste Bier van Gambrinus', 15, null, 'gebrouwen door de koning van het bier', '#fffbe0', '#ffd75e', '#ffffff', 'X'],
  // seasonal beers: only poured while their season runs
  ['herfstbok', 'Herfstbok van de dorpsbrouwer', 2, 6.5, 'herfstbok', '#8a3a14', '#451a06', '#ecd3a8', 'D', 'herfst'],
  ['paddenstoel', 'Paddenstoelenstout', 4, 8.0, 'fantasiestout uit het Zoniënwoud', '#2a1a10', '#0a0503', '#d9bb8c', 'X', 'herfst'],
  ['pompoen', 'Pompoenbier', 3, 6.6, 'herfstbier met pompoen en kruiden', '#e07a1f', '#9a4a0a', '#fbe3c4', 'X', 'halloween'],
  ['spokenstout', 'Spokenstout van de Zwarte Abdij', 7, 11.0, 'fantasiestout, enkel bij volle maan', '#120a1a', '#000000', '#cfc2e6', 'X', 'halloween'],
  ['speculaas', 'Speculaasbier', 2, 7.0, 'winterbier met speculaaskruiden', '#9a5a20', '#5a3010', '#f2dcb8', 'X', 'sinterklaas'],
  ['mijter', 'Mijterbier van de Sint', 5, 9.0, 'fantasietripel met pepernoten', '#d43a2a', '#7a1010', '#fff3dc', 'X', 'sinterklaas'],
  ['gluhkriek', 'Liefmans Glühkriek', 2, 6.5, 'warme kriek', '#9a1028', '#560612', '#f6c9d2', 'F', 'kerst'],
  ['deliriumnoel', 'Delirium Noël', 3, 10.0, 'kerstbier', '#7a2a14', '#3a1206', '#ecd3a8', 'D', 'kerst'],
  ['carolusxmas', 'Gouden Carolus Christmas', 4, 10.5, 'kerstbier', '#5a1e0c', '#250b03', '#e0c495', 'D', 'kerst'],
  ['bernarduskerst', 'St. Bernardus Christmas Ale', 4, 10.0, 'kerstbier', '#6b2a12', '#2f1005', '#e6cda4', 'D', 'kerst'],
  ['malheurbrut', 'Malheur Bière Brut', 5, 11.0, 'bier gerijpt als champagne', '#f6e08a', '#e0b84a', '#ffffff', 'B', 'nieuwjaar'],
  ['carnavalsbier', 'Carnavalsbier van de stoet', 2, 7.0, 'fantasiebier met confetti', '#f4b84a', '#d0852a', '#ffffff', 'X', 'carnaval'],
  ['lentebier', 'Lentebier van de hoeve', 1, 6.0, 'saison voor de lente', '#f6d36a', '#e3a92c', '#ffffff', 'B', 'lente'],
  ['paasbier', 'Paasbier met eitjes', 3, 7.5, 'fantasie-paasbier', '#f2c35a', '#d69a2a', '#fff6d0', 'X', 'lente'],
  ['radler', 'Zomerradler', 1, 2.0, 'pils met citroen', '#f9e27a', '#ecc23a', '#ffffff', 'P', 'zomer'],
  ['terrastripel', 'Terrastripel', 4, 8.5, 'tripel voor op het terras', '#f6cf55', '#dfa224', '#ffffff', 'B', 'zomer'],
  ['driekleur', 'Driekleurtripel', 6, 9.0, 'feestbier voor 21 juli', '#1a1a1a', '#e01e2a', '#f9d71c', 'X', 'nationale'],
];
const BEERS = RAW.map(([id, name, r, abv, style, top, bottom, foam, types = '', season = null]) => ({ id, name, r, abv, style, c: [top, bottom], foam, types, season }));
const CORE = BEERS.filter(b => !b.season);
const BEER = Object.fromEntries(BEERS.map(b => [b.id, b]));
const BY_TIER = RARITIES.map((_, i) => BEERS.filter(b => b.r === i));
const isType = (b, t) => b.types.includes(t);
const hasTier = (s, t) => BY_TIER[t].some(b => s.counts[b.id] > 0);
const ownedOf = (s, pred) => BEERS.filter(b => pred(b) && s.counts[b.id] > 0).length;

// Beer types: complete one for a permanent bonus
const SETS = [
  { id: 'pils',     ico: '🍺', name: 'Pilsjes',          bonus: 0.05, reward: 'bak', beers: CORE.filter(b => isType(b, 'P')) },
  { id: 'amber',    ico: '🟠', name: 'Amber & ale',      bonus: 0.05, reward: 'bak', beers: CORE.filter(b => isType(b, 'A')) },
  { id: 'blond',    ico: '🌾', name: 'Blond & tripel',   bonus: 0.10, reward: 'krat', beers: CORE.filter(b => isType(b, 'B') && b.r <= 4) },
  { id: 'donker',   ico: '🟤', name: 'Dubbel & donker',  bonus: 0.10, reward: 'krat', beers: CORE.filter(b => isType(b, 'D') && b.r <= 4) },
  { id: 'trappist', ico: '⛪', name: 'Trappisten',       bonus: 0.15, reward: 'krat', beers: CORE.filter(b => isType(b, 'T') && !isType(b, 'M') && b.r <= 4) },
  { id: 'rood',     ico: '🍷', name: 'Vlaams rood',      bonus: 0.10, reward: 'krat', beers: CORE.filter(b => isType(b, 'R') && b.r <= 7) },
  { id: 'fruit',    ico: '🍒', name: 'Fruitbieren',      bonus: 0.10, reward: 'krat', beers: CORE.filter(b => isType(b, 'F') && b.r <= 4) },
  { id: 'lambiek',  ico: '🍾', name: 'Lambiek & geuze',  bonus: 0.20, reward: 'vat', beers: CORE.filter(b => isType(b, 'L') && b.r <= 4) },
  { id: 'paters',   ico: '🙏', name: 'Paterbieren',      bonus: 0.25, reward: 'vat', beers: CORE.filter(b => isType(b, 'M')) },
  { id: 'edel',     ico: '💎', name: 'Edelstenen (één per soort)', bonus: 0.30, reward: 'vat', any: [5, 6, 7, 8, 9, 10, 11] },
  { id: 'fantasie', ico: '🦄', name: 'Fantasiebieren',   bonus: 0.50, reward: 'vat', beers: CORE.filter(b => isType(b, 'X')) },
  { id: 'seizoen',  ico: '📅', name: 'Seizoensbieren (het hele jaar)', bonus: 0.30, reward: 'vat', beers: BEERS.filter(b => b.season) },
];
const setHave = (s, st) => st.any ? st.any.filter(t => hasTier(s, t)).length : st.beers.filter(b => s.counts[b.id] > 0).length;
const setSize = st => st.any ? st.any.length : st.beers.length;

// Collection milestones (unique beers)
const COL_MILESTONES = [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, CORE.length]
  .filter((n, i, a) => n <= CORE.length && a.indexOf(n) === i)
  .map(n => ({ n, crate: n >= 90 ? 'vat' : n >= 50 ? 'krat' : n >= 20 && n % 20 === 0 ? 'bak' : null }));

// =====================================================================
// GLASSES, BACKGROUNDS, THEMES
// =====================================================================
const SHAPE = {
  vaasje:  { d: 'M30 20 L170 20 L152 280 Q150 290 140 290 L60 290 Q50 290 48 280 Z', bottom: 286, bx: [60, 140], hl: '<path d="M44 40 L56 260" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round"/>' },
  tulp:    { d: 'M55 20 C40 60 22 100 32 140 C42 180 80 200 92 212 L92 272 L60 284 L140 284 L108 272 L108 212 C120 200 158 180 168 140 C178 100 160 60 145 20 Z', bottom: 210, bx: [70, 130], hl: '<path d="M44 70 C36 110 40 140 52 160" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round"/>' },
  kwak:    { d: 'M70 20 L130 20 L122 170 C122 190 160 210 160 245 C160 280 130 292 100 292 C70 292 40 280 40 245 C40 210 78 190 78 170 Z', bottom: 290, bx: [75, 125], hl: '' },
  kelk:    { d: 'M30 20 L170 20 C170 110 140 150 108 158 L108 255 L150 280 L150 288 L50 288 L50 280 L92 255 L92 158 C60 150 30 110 30 20 Z', bottom: 156, bx: [80, 120], hl: '<path d="M44 40 C44 90 58 120 76 136" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round"/>' },
  geuze:   { d: 'M50 20 L150 20 L146 284 Q146 290 140 290 L60 290 Q54 290 54 284 Z', bottom: 286, bx: [65, 135], hl: '<path d="M62 40 L66 270" stroke="rgba(255,255,255,0.3)" stroke-width="5" stroke-linecap="round"/>' },
  pul:     { d: 'M40 20 L150 20 L150 280 Q150 290 140 290 L50 290 Q40 290 40 280 Z', bottom: 284, bx: [55, 135], hl: '' },
  bolleke: { d: 'M45 20 C18 80 26 165 88 192 L92 200 L92 266 L58 282 L142 282 L108 266 L108 200 L112 192 C174 165 182 80 155 20 Z', bottom: 196, bx: [70, 130], hl: '<path d="M40 60 C34 110 46 150 70 170" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round"/>' },
  fluit:   { d: 'M70 20 L130 20 L122 200 Q120 214 104 216 L104 270 L132 284 L68 284 L96 270 L96 216 Q80 214 78 200 Z', bottom: 214, bx: [85, 115], hl: '<path d="M80 40 L86 190" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-linecap="round"/>' },
};
const KWAK_BACK = '<rect x="22" y="110" width="12" height="190" rx="3" fill="#8a5a2b"/><rect x="166" y="110" width="12" height="190" rx="3" fill="#8a5a2b"/><rect x="16" y="288" width="168" height="12" rx="3" fill="#6e4520"/>';
const KWAK_FRONT = '<rect x="22" y="150" width="156" height="12" rx="4" fill="#9b6833"/>';
const PUL_HANDLE = c => `<path d="M150 70 C196 70 196 210 150 210" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/><g fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3"><circle cx="70" cy="90" r="12"/><circle cx="120" cy="90" r="12"/><circle cx="70" cy="150" r="12"/><circle cx="120" cy="150" r="12"/><circle cx="70" cy="210" r="12"/><circle cx="120" cy="210" r="12"/></g>`;
const SPARKLES = c => `<g fill="${c}"><path d="M40 60 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"/><path d="M160 150 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/><path d="M60 230 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/></g>`;
const STEM = c => `<path d="M92 158 L108 158 L108 255 L150 280 L150 288 L50 288 L50 280 L92 255 Z" fill="${c}"/>`;
const SKINS = [
  { id: 'vaasje',    name: 'Vaasje',            shape: 'vaasje',  stroke: 'rgba(255,255,255,0.55)', unlock: 'Standaard', ok: () => true },
  { id: 'tulp',      name: 'Tulpglas',          shape: 'tulp',    stroke: 'rgba(255,255,255,0.55)', unlock: 'Drink zelf 25 pintjes', ok: s => s.total >= 25 },
  { id: 'bolleke',   name: 'Bolleke',           shape: 'bolleke', stroke: 'rgba(255,255,255,0.55)', unlock: 'Drink een De Koninck', ok: s => s.counts.koninck > 0 },
  { id: 'kwak',      name: 'Kwakglas',          shape: 'kwak',    stroke: 'rgba(255,255,255,0.55)', back: KWAK_BACK, front: KWAK_FRONT, unlock: 'Drink ne Kwak', ok: s => s.counts.kwak > 0 },
  { id: 'kelk',      name: 'Trappistenkelk',    shape: 'kelk',    stroke: 'rgba(255,255,255,0.55)', unlock: 'Drink een trappist', ok: s => ownedOf(s, b => isType(b, 'T')) > 0 },
  { id: 'geuze',     name: 'Geuzeglas',         shape: 'geuze',   stroke: 'rgba(255,255,255,0.55)', unlock: 'Drink een lambiek', ok: s => ownedOf(s, b => isType(b, 'L')) > 0 },
  { id: 'fluit',     name: 'Fluit',             shape: 'fluit',   stroke: 'rgba(255,255,255,0.55)', unlock: 'Drink een Vlaams rood', ok: s => ownedOf(s, b => isType(b, 'R')) > 0 },
  { id: 'pul',       name: 'Bierpul',           shape: 'pul',     stroke: 'rgba(255,255,255,0.6)', front: PUL_HANDLE('rgba(255,255,255,0.6)'), unlock: 'Drink zelf 250 pintjes', ok: s => s.total >= 250 },
  { id: 'parel',     name: 'Parelmoeren bolleke', shape: 'bolleke', stroke: '#f4ead8', glow: '#f4ead8', unlock: 'Vind een parel-bier', ok: s => hasTier(s, 5) },
  { id: 'smaragd',   name: 'Smaragden tulp',    shape: 'tulp',    stroke: '#3ddc84', glow: '#3ddc84', unlock: 'Vind een smaragd-bier', ok: s => hasTier(s, 6) },
  { id: 'robijn',    name: 'Robijnen kelk',     shape: 'kelk',    stroke: '#ff4d6d', glow: '#ff4d6d', back: STEM('#a3102e'), unlock: 'Vind een robijn-bier', ok: s => hasTier(s, 7) },
  { id: 'saffier',   name: 'Saffieren stange',  shape: 'geuze',   stroke: '#5b8cff', glow: '#5b8cff', unlock: 'Vind een saffier-bier', ok: s => hasTier(s, 8) },
  { id: 'amethist',  name: 'Amethisten fluit',  shape: 'fluit',   stroke: '#b56cff', glow: '#b56cff', unlock: 'Vind een amethist-bier', ok: s => hasTier(s, 9) },
  { id: 'diamant',   name: 'Diamanten vaasje',  shape: 'vaasje',  stroke: '#e8fbff', glow: '#d9f6ff', front: SPARKLES('#ffffff'), unlock: 'Vind een diamant-bier', ok: s => hasTier(s, 10) },
  { id: 'obsidiaan', name: 'Obsidiaanpul',      shape: 'pul',     stroke: '#6a5a9a', glow: '#9d85ff', front: PUL_HANDLE('#2b2340'), unlock: 'Vind een obsidiaan-bier', ok: s => hasTier(s, 11) },
  { id: 'regenboog', name: 'Regenboogpul',      shape: 'pul',     stroke: 'url(#rainbowStroke)', front: PUL_HANDLE('url(#rainbowStroke)'), unlock: 'Vind een regenboogbier', ok: s => hasTier(s, 12) },
  { id: 'kosmisch',  name: 'Kosmische kelk',    shape: 'kelk',    stroke: '#7af0ff', glow: '#7af0ff', back: STEM('#2a1a6a'), front: SPARKLES('#7af0ff'), unlock: 'Vind een kosmisch bier', ok: s => hasTier(s, 13) },
  { id: 'goud',      name: 'Gouden kelk',       shape: 'kelk',    stroke: '#ffd75e', glow: '#ffd75e', back: STEM('#e0a800'), front: '<path d="M30 20 L170 20" stroke="#fff1a8" stroke-width="8" stroke-linecap="round"/>' + SPARKLES('#fff1a8'), unlock: 'Vind een mythisch bier', ok: s => hasTier(s, 14) },
  { id: 'goddelijk', name: 'Goddelijke tulp',   shape: 'tulp',    stroke: '#ffffff', glow: '#fff7d6', front: '<ellipse cx="100" cy="6" rx="46" ry="8" fill="none" stroke="#ffd75e" stroke-width="4"/>' + SPARKLES('#ffffff'), unlock: 'Vind het goddelijke bier', ok: s => hasTier(s, 15) },
];
const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));

// ---- seasons (by calendar date, every year) ----
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const SEASONS = [
  { id: 'nationale',   ico: '🇧🇪', name: 'Nationale feestdag',    from: [7, 20],  to: [7, 22], eff: [['prod', 2], ['click', 2]],      effTxt: 'personeel en eigen slokken ×2', amb: 'flags',     gift: 'Vlaggetje zwaaien', crate: 'vat' },
  { id: 'nieuwjaar',   ico: '🎆', name: 'Oudejaar en Nieuwjaar',  from: [12, 31], to: [1, 1],  eff: [['prod', 2], ['click', 2]],      effTxt: 'alles ×2 en vuurwerk', amb: 'fireworks', gift: 'Klinken op het nieuwe jaar', crate: 'krat' },
  { id: 'halloween',   ico: '🎃', name: 'Halloween',              from: [10, 25], to: [11, 2], eff: [['luck', 1.5]],                  effTxt: 'geluk ×1,5 en spoken in het café', amb: 'bats', gift: 'Snoep of bier!', crate: 'bak' },
  { id: 'kerst',       ico: '🎄', name: 'Kerstperiode',           from: [12, 7],  to: [1, 6],  eff: [['prod', 1.25], ['click', 1.25]], effTxt: 'personeel en eigen slokken ×1,25, sneeuw', amb: 'snow', gift: 'Cadeau onder de boom', crate: 'bak' },
  { id: 'sinterklaas', ico: '🎁', name: 'Sinterklaastijd',        from: [11, 11], to: [12, 6], eff: [['xp', 1.25]],                   effTxt: 'XP ×1,25 en pepernoten', amb: 'cookies', gift: 'Schoen zetten', crate: 'bak' },
  { id: 'carnaval',    ico: '🎭', name: 'Carnaval',               from: [2, 10],  to: [3, 5],  eff: [['click', 1.5]],                 effTxt: 'eigen slokken ×1,5 en confetti', amb: 'confetti', gift: 'Confetti vangen', crate: 'bak' },
  { id: 'lente',       ico: '🐣', name: 'Lente en Pasen',         from: [3, 20],  to: [4, 30], eff: [['luck', 1.2]],                  effTxt: 'geluk ×1,2 en paaseieren in je glas', amb: 'blossoms', gift: 'Paaseieren rapen', crate: 'bak' },
  { id: 'zomer',       ico: '☀️', name: 'Terrasjesweer',          from: [6, 21],  to: [8, 31], eff: [['prod', 1.25]],                 effTxt: 'personeel ×1,25', amb: 'sun', gift: 'Een pintje op het terras', crate: 'bak' },
  { id: 'herfst',      ico: '🍂', name: 'Herfstbierfeesten',      from: [9, 20],  to: [10, 31], eff: [['prod', 1.25]],                effTxt: 'personeel ×1,25 en vallende bladeren', amb: 'leaves', gift: 'Een maß halen', crate: 'bak' },
];
const SEASON = Object.fromEntries(SEASONS.map(x => [x.id, x]));
const mdKey = (m, d) => m * 100 + d;
function inSeason(x, date = new Date()) {
  const k = mdKey(date.getMonth() + 1, date.getDate()), f = mdKey(...x.from), t = mdKey(...x.to);
  return f <= t ? k >= f && k <= t : k >= f || k <= t;
}
let activeSeasons = [];
const seasonActive = id => activeSeasons.includes(id);
function daysUntil(md) {
  const nowD = new Date(); nowD.setHours(0, 0, 0, 0);
  let d = new Date(nowD.getFullYear(), md[0] - 1, md[1]);
  if (d < nowD) d = new Date(nowD.getFullYear() + 1, md[0] - 1, md[1]);
  return Math.round((d - nowD) / 86400000);
}
const BGS = [
  { id: 'bruin',      name: 'Bruin café',      unlock: 'Standaard',                   ok: () => true },
  { id: 'biljart',    name: 'Biljartlaken',    unlock: 'Haal level 10',               ok: s => levelInfo(s.xp).lvl >= 10 },
  { id: 'kermis',     name: 'Kermis',          unlock: 'Koop een kermis-bierkraam',   ok: s => (s.bld.kermis || 0) > 0 },
  { id: 'abdij',      name: 'Abdij',           unlock: 'Koop een trappistenabdij',    ok: s => (s.bld.abdij || 0) > 0 },
  { id: 'festival',   name: 'Festivalweide',   unlock: 'Koop een bierfestival',       ok: s => (s.bld.festival || 0) > 0 },
  { id: 'brugge',     name: 'Brugse reien',    unlock: 'Leg een bierpijpleiding',     ok: s => (s.bld.pijp || 0) > 0 },
  { id: 'hemel',      name: 'Hemelpoort',      unlock: 'Bouw de hemelse brouwerij',   ok: s => (s.bld.hemel || 0) > 0 },
  { id: 'ster',       name: 'Sterrenhemel',    unlock: 'Open een nieuwe kroeg',       ok: s => s.stars > 0 },
  { id: 'oostende',   name: 'Zonsondergang in Oostende', unlock: 'Haal 400 in de tapwedstrijd', ok: s => s.mg.best >= 400 },
  { id: 'ardennen',   name: 'Ardense bossen',  unlock: 'Vervolledig 3 biertypes',     ok: s => s.sets.length >= 3 },
  { id: 'grotemarkt', name: 'Grote Markt bij nacht', unlock: 'Kom 7 dagen na elkaar langs', ok: s => s.streak >= 7 },
  { id: 'disco',      name: 'Discokelder',     unlock: 'Vang 25 gouden doppen',       ok: s => s.caps >= 25 },
  { id: 'parel',      name: 'Parelmoer',       unlock: 'Vind een parel-bier',         ok: s => hasTier(s, 5) },
  { id: 'smaragd',    name: 'Smaragdgroen',    unlock: 'Vind een smaragd-bier',       ok: s => hasTier(s, 6) },
  { id: 'robijn',     name: 'Robijnrood',      unlock: 'Vind een robijn-bier',        ok: s => hasTier(s, 7) },
  { id: 'saffier',    name: 'Saffierblauw',    unlock: 'Vind een saffier-bier',       ok: s => hasTier(s, 8) },
  { id: 'amethist',   name: 'Amethistpaars',   unlock: 'Vind een amethist-bier',      ok: s => hasTier(s, 9) },
  { id: 'diamant',    name: 'Diamantglans',    unlock: 'Vind een diamant-bier',       ok: s => hasTier(s, 10) },
  { id: 'obsidiaan',  name: 'Obsidiaan',       unlock: 'Vind een obsidiaan-bier',     ok: s => hasTier(s, 11) },
  { id: 'regenboog',  name: 'Regenboog',       unlock: 'Vind een regenboogbier',      ok: s => hasTier(s, 12) },
  { id: 'kosmisch',   name: 'Kosmos',          unlock: 'Vind een kosmisch bier',      ok: s => hasTier(s, 13) },
  { id: 'goud',       name: 'Gouden zaal',     unlock: 'Vind een mythisch bier',      ok: s => hasTier(s, 14) },
  { id: 'goddelijk',  name: 'Hemels licht',    unlock: 'Vind het goddelijke bier',    ok: s => hasTier(s, 15) },
  ...SEASONS.map(x => ({ id: 's-' + x.id, name: x.name, unlock: `Speel tijdens ${x.name} (${x.from[1]} ${MONTHS[x.from[0] - 1]} – ${x.to[1]} ${MONTHS[x.to[0] - 1]})`, ok: s => s.seasonsPlayed.includes(x.id) })),
];

// UI themes: tokens + display face + corner radius
const THEMES = [
  { id: 'klassiek', name: 'Klassiek café', font: 'Alfa Slab One', fb: 'Georgia, serif', dscale: 1, rc: 12, rb: 999, v: { accent: '#f7c548', 'on-accent': '#2a1a05', panel: '#26190cdd', 'panel-solid': '#26190c', line: '#4a341c', text: '#fbefd9', muted: '#c9b48f' }, unlock: 'Standaard', ok: () => true },
  { id: 'hop',      name: 'Hophelder',     font: 'Bree Serif', fb: 'Georgia, serif', dscale: 1.05, rc: 14, rb: 14, v: { accent: '#9be15d', 'on-accent': '#10240a', panel: '#15240fdd', 'panel-solid': '#15240f', line: '#2f4a22', text: '#effbe4', muted: '#a8c493' }, unlock: 'Haal level 5', ok: s => levelInfo(s.xp).lvl >= 5 },
  { id: 'kriek',    name: 'Kriek',         font: 'Lobster', fb: 'cursive', dscale: 1.1, rc: 18, rb: 999, v: { accent: '#ff5d7a', 'on-accent': '#3a0510', panel: '#2a0f16dd', 'panel-solid': '#2a0f16', line: '#5a2030', text: '#ffe9ee', muted: '#d8a3b0' }, unlock: 'Drink 3 verschillende fruitbieren', ok: s => ownedOf(s, b => isType(b, 'F')) >= 3 },
  { id: 'trappist', name: 'Trappist',      font: 'UnifrakturMaguntia', fb: 'serif', dscale: 1.1, rc: 4, rb: 6, v: { accent: '#e9d3ad', 'on-accent': '#2a1607', panel: '#2b1d12dd', 'panel-solid': '#2b1d12', line: '#5a4026', text: '#f6ead6', muted: '#c2a985' }, unlock: 'Drink 5 verschillende trappisten', ok: s => ownedOf(s, b => isType(b, 'T')) >= 5 },
  { id: 'nacht',    name: 'Nachtcafé',     font: 'Righteous', fb: 'sans-serif', dscale: 1, rc: 16, rb: 16, v: { accent: '#7ab8ff', 'on-accent': '#06142a', panel: '#0f1830dd', 'panel-solid': '#0f1830', line: '#24365e', text: '#e8f0ff', muted: '#93a7cc' }, unlock: 'Haal de prestatie Nachtuil', ok: s => s.ach.includes('nachtuil') },
  { id: 'arcade',   name: 'Arcade',        font: 'Press Start 2P', fb: 'monospace', dscale: 0.62, rc: 0, rb: 0, v: { accent: '#5fff8a', 'on-accent': '#04140a', panel: '#0a140dee', 'panel-solid': '#0a140d', line: '#1f5a30', text: '#d8ffe2', muted: '#7fbf90' }, unlock: 'Haal 400 in de tapwedstrijd', ok: s => s.mg.best >= 400 },
  { id: 'neon',     name: 'Neonbar',       font: 'Monoton', fb: 'sans-serif', dscale: 0.9, rc: 20, rb: 999, v: { accent: '#ff4fd8', 'on-accent': '#2a0424', panel: '#1a0a22dd', 'panel-solid': '#1a0a22', line: '#5a1f6a', text: '#ffe6fb', muted: '#d39acb' }, unlock: 'Vang 10 gouden doppen', ok: s => s.caps >= 10 },
  { id: 'goud',     name: 'Gouden tap',    font: 'Cinzel Decorative', fb: 'serif', dscale: 0.92, rc: 8, rb: 8, v: { accent: '#ffd75e', 'on-accent': '#2a1d00', panel: '#1c1505ee', 'panel-solid': '#1c1505', line: '#5a4515', text: '#fff6da', muted: '#d8c48a' }, unlock: 'Open een nieuwe kroeg', ok: s => s.stars > 0 },
  { id: 'regenboog',name: 'Regenboog',     font: 'Bungee', fb: 'sans-serif', dscale: 0.9, rc: 14, rb: 999, v: { accent: '#fff35c', 'on-accent': '#2a2400', panel: '#1a1028dd', 'panel-solid': '#1a1028', line: '#4a2a6a', text: '#fffbe8', muted: '#c9b6e8' }, unlock: 'Vind een regenboogbier', ok: s => hasTier(s, 12) },
];
const THEME = Object.fromEntries(THEMES.map(t => [t.id, t]));

// =====================================================================
// ECONOMY DATA
// =====================================================================
const SIPS_PER_PINT = 20;
const BUILDINGS = [
  { id: 'rietje',    ico: '🥤', name: 'Rietje',              sps: 0.1,    cost: 15,      desc: 'Slurpt heel traag mee.', up: ['Dubbel rietje', 'Krulrietje', 'Turborietje', 'Kwantumrietje', 'Rietje van de toekomst'] },
  { id: 'stamgast',  ico: '🧔', name: 'Stamgast',            sps: 1,      cost: 100,     desc: 'Zit altijd op dezelfde kruk.', up: ['Vaste plek aan de toog', 'Eigen bierkaart', 'Naam op de muur', 'Stamgast van het jaar', 'Eigen kruk met naambordje'] },
  { id: 'nonkel',    ico: '👴', name: 'Nonkel Jos',          sps: 8,      cost: 1100,    desc: 'Heeft nog nooit een glas laten staan.', up: ["Nonkel Jos z'n bierbuik", 'Nonkel Jos op familiefeest', 'Nonkel Jos met pensioen', 'Nonkel Jos op de kermis', 'Nonkel Jos, de legende'] },
  { id: 'studenten', ico: '🎓', name: 'Studentenclub',       sps: 47,     cost: 12000,   desc: 'Cantus tot de zon opkomt.', up: ['Doop', 'Cantus', 'Clubavond', 'Praeses-mandaat', 'Erelid'] },
  { id: 'kermis',    ico: '🎡', name: 'Kermis-bierkraam',    sps: 260,    cost: 130000,  desc: 'Tussen de smoutebollen en de botsauto’s.', up: ['Smoutebollen erbij', 'Botsauto-bar', 'Kermiszondag', 'Foorkramer van het jaar', 'Reuzenrad-tap'] },
  { id: 'festival',  ico: '🎪', name: 'Bierfestival',        sps: 1400,   cost: 1.4e6,   desc: 'Duizenden proevers, één doel.', up: ['Extra toog', 'VIP-tent', 'Headliner', 'Driedaags festival', 'Camping-tap'] },
  { id: 'abdij',     ico: '⛪', name: 'Trappistenabdij',     sps: 7800,   cost: 2e7,     desc: 'Monniken brouwen én drinken.', up: ['Extra monnik', 'Gebedsuren', 'Kloosterregel', 'Pauselijke zegen', 'Heiligverklaring'] },
  { id: 'pijp',      ico: '🛢️', name: 'Bierpijpleiding',    sps: 44000,  cost: 3.3e8,   desc: 'Zoals die in Brugge, maar dan tot aan je mond.', up: ['Dikkere buis', 'Tweede leiding', 'Ondergrondse ring', 'Europees netwerk', 'Trans-Atlantische leiding'] },
  { id: 'hemel',     ico: '😇', name: 'Hemelse brouwerij',   sps: 260000, cost: 5.1e9,   desc: 'Sint-Arnoldus zelf staat aan de ketel.', up: ['Engelenkoor', 'Hemelpoort-tap', 'Wolkenvat', 'Goddelijk recept', 'Hemelse cantus'] },
  { id: 'baron',     ico: '🎩', name: 'Bierbaron',           sps: 1.6e6,  cost: 7.5e10,  desc: 'Koopt brouwerijen zoals jij pintjes.', up: ['Bierbeurs', 'Fusie', 'Monopolie', 'Bierimperium', 'Wereldmacht'] },
  { id: 'portaal',   ico: '🌀', name: 'Bierportaal',         sps: 1e7,    cost: 1e12,    desc: 'Tapt rechtstreeks uit een andere dimensie.', up: ['Stabiel portaal', 'Dubbel portaal', 'Portaal naar de kelder', 'Portaal naar Westvleteren', 'Portaal overal'] },
  { id: 'tijd',      ico: '⏳', name: 'Tijdtap',             sps: 6.5e7,  cost: 1.4e13,  desc: 'Drinkt de pintjes van morgen vandaag al.', up: ['Vat uit 1900', 'Vat uit de middeleeuwen', 'Vat uit de toekomst', 'Tijdlus-tap', 'Eeuwig vat'] },
  { id: 'kosmos',    ico: '🪐', name: 'Kosmische brouwketel', sps: 4.3e8, cost: 1.7e14,  desc: 'Brouwt met sterrenstof en zwarte gaten.', up: ['Maanbrouwsel', 'Saturnusringen-tap', 'Zwart gat-vat', 'Melkwegbrouwerij', 'Big Bang-brouwsel'] },
  { id: 'gambrinus', ico: '👑', name: "Gambrinus' troon",    sps: 2.9e9,  cost: 2.1e15,  desc: 'De koning van het bier schenkt zelf in.', up: ['Kroon van Gambrinus', 'Scepter', 'Hofbrouwer', 'Koninklijke tap', 'Eeuwige troon'] },
];
const BLD_UP_AT = [1, 5, 25, 50, 100], BLD_UP_COST = [20, 200, 2000, 2e5, 2e7], BLD_UP_MULT = 1.6;

const UPGRADES = [
  { id: 'zelftap', ico: '🚰', name: 'Zelftap-installatie', desc: 'Is je glas leeg, dan wordt het meteen bijgevuld zodat je kan doordrinken.', cost: 50, show: () => true },
  { id: 'klik1', ico: '👄', name: 'Grotere slokken', desc: 'Je eigen slokken leveren ×2 bonnekes op.', cost: 100, show: s => s.taps >= 10 || s.total >= 1 },
  { id: 'klik2', ico: '🦷', name: 'Keelgat van staal', desc: 'Je eigen slokken leveren ×2 bonnekes op.', cost: 5000, show: s => s.taps >= 100 || s.total >= 15 },
  { id: 'klik3', ico: '⚡', name: 'Ad fundum-techniek', desc: 'Elke eigen slok levert ook 1% van je bonnekes/s op.', cost: 5e4, show: s => s.bonAll >= 1e4 },
  { id: 'klik4', ico: '🥇', name: 'Wereldkampioen bierdrinken', desc: 'Elke eigen slok levert nog eens 1% van je bonnekes/s op.', cost: 5e6, show: s => s.bonAll >= 1e6 },
  { id: 'klik5', ico: '🏅', name: 'Gouden keel', desc: 'Elke eigen slok levert nog eens 1% van je bonnekes/s op.', cost: 5e8, show: s => s.bonAll >= 1e8 },
  { id: 'klik6', ico: '🫗', name: 'Slokkenmeester', desc: 'Je eigen slokken leveren ×2 bonnekes op.', cost: 5e10, show: s => s.bonAll >= 1e10 },
  { id: 'klik7', ico: '🌟', name: 'Legendarische keel', desc: 'Elke eigen slok levert nog eens 1% van je bonnekes/s op.', cost: 5e12, show: s => s.bonAll >= 1e12 },
  { id: 'bon1', ico: '🎟️', name: 'Happy hour', desc: 'Alle bonnekes +50%.', cost: 1000, show: s => s.bonAll >= 300 },
  { id: 'bon2', ico: '🗂️', name: 'Drankkaart met stempels', desc: 'Alle bonnekes +50%.', cost: 1e5, show: s => s.bonAll >= 3e4 },
  { id: 'bon3', ico: '🤝', name: 'Sponsor: lokale brouwer', desc: 'Alle bonnekes +50%.', cost: 1e7, show: s => s.bonAll >= 3e6 },
  { id: 'bon4', ico: '🦁', name: 'Hoofdsponsor van de Rode Duivels', desc: 'Alle bonnekes +50%.', cost: 1e9, show: s => s.bonAll >= 3e8 },
  { id: 'bon5', ico: '📈', name: 'Beursgenoteerd café', desc: 'Alle bonnekes +50%.', cost: 1e11, show: s => s.bonAll >= 3e10 },
  { id: 'bon6', ico: '🏛️', name: 'Unesco-erfgoed: Belgische biercultuur', desc: 'Alle bonnekes +50%. (Echt waar, sinds 2016.)', cost: 1e13, show: s => s.bonAll >= 3e12 },
  { id: 'bon7', ico: '🌍', name: 'Wereldbierkampioen', desc: 'Alle bonnekes +50%.', cost: 1e15, show: s => s.bonAll >= 3e14 },
  { id: 'pint1', ico: '📜', name: 'Bierkaart met uitleg', desc: 'Een pint die je zelf uitdrinkt levert ×2 bonus op.', cost: 1e4, show: s => s.total >= 30 },
  { id: 'pint2', ico: '🍷', name: 'Biersommelier', desc: 'Een pint die je zelf uitdrinkt levert ×2 bonus op.', cost: 1e8, show: s => s.total >= 150 },
  { id: 'pint3', ico: '🔬', name: 'Zytholoog', desc: 'Bierkunde als wetenschap: zelf uitgedronken pinten ×2 bonus.', cost: 1e12, show: s => s.total >= 500 },
  { id: 'dop1', ico: '🧢', name: 'Kroonkurkenverzamelaar', desc: 'Gouden doppen verschijnen 50% vaker.', cost: 77777, show: s => s.caps >= 1 },
  { id: 'dop2', ico: '🧲', name: 'Gouden dop-magneet', desc: 'Effecten van gouden doppen duren twee keer zo lang.', cost: 7.77e6, show: s => s.caps >= 5 },
  { id: 'dop3', ico: '🏭', name: 'Gouden doppenfabriek', desc: 'Gouden doppen geven 50% meer.', cost: 7.77e9, show: s => s.caps >= 15 },
  { id: 'kelder', ico: '🗝️', name: 'Bierkelder', desc: 'Elke dag een extra bak bier.', cost: 2.5e7, show: s => s.bonAll >= 1e7 },
  { id: 'kelder2', ico: '🏰', name: 'Gewelfde bierkelder', desc: 'Elke dag een extra krat bier.', cost: 2.5e11, show: s => s.bonAll >= 1e11 },
];
BUILDINGS.forEach(b => b.up.forEach((name, i) => UPGRADES.push({
  id: `${b.id}${i}`, ico: b.ico, name, desc: `${b.name} drinkt ×${BLD_UP_MULT.toString().replace('.', ',')}.`, cost: b.cost * BLD_UP_COST[i], bld: b.id,
  show: s => (s.bld[b.id] || 0) >= BLD_UP_AT[i],
})));
const UPG = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

// =====================================================================
// LEVELS & SKILLS
// =====================================================================
const xpToNext = lvl => Math.round(60 * Math.pow(lvl, 1.5));
let liCache = { xp: -1, v: null };
function levelInfo(xp) {
  if (xp === liCache.xp) return liCache.v;
  let lvl = 1, rest = xp;
  while (rest >= xpToNext(lvl) && lvl < 9999) { rest -= xpToNext(lvl); lvl++; }
  liCache = { xp, v: { lvl, into: rest, need: xpToNext(lvl) } };
  return liCache.v;
}
const SKILLS = [
  { id: 'slok',     tier: 1, ico: '💨', name: 'Snelle slokker',   max: 5, desc: 'Je drinkt sneller als je vasthoudt.',             eff: n => `−${n * 8}% drinktijd` },
  { id: 'kenner',   tier: 1, ico: '🎓', name: 'Bierkenner',       max: 5, desc: 'Meer XP uit alles.',                               eff: n => `+${n * 10}% XP` },
  { id: 'geluk',    tier: 1, ico: '🍀', name: 'Gelukzak',         max: 5, desc: 'Zeldzaam en beter komt vaker.',                     eff: n => `×${(1 + n * 0.15).toFixed(2).replace('.', ',')} kans op zeldzaam+` },
  { id: 'fooi',     tier: 1, ico: '🫙', name: 'Fooienpot',        max: 5, desc: 'Je eigen slokken en pinten leveren meer op.',       eff: n => `+${n * 10}% eigen bonnekes` },
  { id: 'tap',      tier: 2, ico: '🍺', name: 'Tapmeester',       max: 5, desc: 'Je personeel drinkt sneller.',                      eff: n => `+${n * 10}% personeel`, req: ['slok', 2] },
  { id: 'dubbel',   tier: 2, ico: '🍻', name: 'Dubbel tappen',    max: 5, desc: 'Kans dat een pint dubbel telt.',                    eff: n => `${n * 4}% kans`, req: ['slok', 2] },
  { id: 'lever',    tier: 2, ico: '🫀', name: 'IJzeren lever',    max: 3, desc: 'De zatheidsmeter stijgt trager en je brokt later.', eff: n => `${n * 2} pintjes uitstel`, req: ['kenner', 2] },
  { id: 'kans',     tier: 2, ico: '🎲', name: 'Tweede kans',      max: 5, desc: 'Kans dat een gewone pint opnieuw getapt wordt.',    eff: n => `${n * 8}% herkansing`, req: ['geluk', 2] },
  { id: 'korting',  tier: 2, ico: '🤝', name: 'Onderhandelaar',   max: 5, desc: 'Personeel en zaken worden goedkoper.',              eff: n => `−${n * 3}% prijs`, req: ['fooi', 2] },
  { id: 'goudhand', tier: 2, ico: '✋', name: 'Gouden hand',      max: 3, desc: 'Gouden doppen komen vaker en duren langer.',        eff: n => `+${n * 20}% vaker, +${n * 10}% langer`, req: ['fooi', 2] },
  { id: 'edel',     tier: 3, ico: '💎', name: 'Edelsteenoog',     max: 3, desc: 'Parel tot kosmisch komt vaker.',                    eff: n => `×${1 + n * 0.5} kans op edelstenen`.replace('.', ','), req: ['geluk', 4] },
  { id: 'krat',     tier: 3, ico: '📦', name: 'Kratjeskenner',    max: 2, desc: 'Er zit meer bier in elke bak, krat en vat.',        eff: n => `+${n} bier per bak`, req: ['kans', 3] },
  { id: 'vasthand', tier: 3, ico: '🎯', name: 'Vaste hand',       max: 3, desc: 'De tapwedstrijd schenkt trager en beloont meer.',   eff: n => `−${n * 10}% snelheid, +${n * 20}% beloning`, req: ['tap', 2] },
  { id: 'nacht',    tier: 3, ico: '🌙', name: 'Nachtploeg',       max: 5, desc: 'Je personeel drinkt harder door als je weg bent.',  eff: n => `${50 + n * 10}% offline`, req: ['tap', 3] },
  { id: 'emmer',    tier: 3, ico: '🪣', name: 'Emmer bij de hand', max: 2, desc: 'Na het brokken kan je sneller verder.',          eff: n => `−${n * 2} s brokken`, req: ['lever', 2] },
  { id: 'arnoldus', tier: 4, ico: '😇', name: 'Zegen van Sint-Arnoldus', max: 1, desc: 'Mythisch en goddelijk ×10.',                eff: n => n ? 'mythisch 0,1%' : 'mythisch 0,01% → 0,1%', req: ['dubbel', 3], req2: ['kans', 3] },
  { id: 'legende',  tier: 4, ico: '🏆', name: 'Legende van de toog', max: 3, desc: 'Alle bonnekes omhoog.',                         eff: n => `+${n * 15}% bonnekes`, req: ['fooi', 5], req2: ['tap', 5] },
  { id: 'ambacht',  tier: 4, ico: '⚒️', name: 'Ambachtelijk',     max: 1, desc: 'Perfecte rondes in de tapwedstrijd tellen dubbel voor de beloning.', eff: () => 'perfecte rondes ×2 beloning', req: ['vasthand', 2] },
];
const SK = Object.fromEntries(SKILLS.map(k => [k.id, k]));

// Prestige tree: bought with hopbellen, kept forever
const HOP_MIN_LEVEL = 25;
const HOP = [
  { id: 'h_bon',   tier: 1, ico: '💰', name: 'Brouwersbloed',        max: 10, base: 3,  grow: 1.8, desc: 'Alle bonnekes ×1,75 per rang.',              eff: n => `×${fmt(Math.pow(1.75, n))} bonnekes` },
  { id: 'h_xp',    tier: 1, ico: '📚', name: 'Wijsheid van de abdij', max: 6,  base: 3,  grow: 1.9, desc: 'Alle XP ×1,5 per rang.',                      eff: n => `×${fmt(Math.pow(1.5, n))} XP` },
  { id: 'h_start', tier: 1, ico: '🚀', name: 'Vliegende start',      max: 6,  base: 2,  grow: 2,   desc: 'Start elke nieuwe brouwerij en kroeg met bonnekes.', eff: n => `${fmt(1000 * Math.pow(10, n))} startbonnekes` },
  { id: 'h_hop',   tier: 1, ico: '🌿', name: 'Hoppige toekomst',     max: 5,  base: 4,  grow: 2.2, desc: 'Meer hopbellen bij elke reset.',               eff: n => `+${n * 25}% hopbellen` },
  { id: 'h_staff', tier: 2, ico: '👨‍🍳', name: 'Familiebrouwerij',   max: 8,  base: 6,  grow: 2,   desc: 'Personeel drinkt ×2 per rang.',                eff: n => `×${fmt(Math.pow(2, n))} personeel`, req: ['h_bon', 2] },
  { id: 'h_luck',  tier: 2, ico: '🍀', name: 'Gezegende gist',       max: 5,  base: 6,  grow: 2,   desc: 'Zeldzaam en beter ×1,3 per rang.',             eff: n => `×${fmt(Math.pow(1.3, n))} geluk`, req: ['h_xp', 2] },
  { id: 'h_sp',    tier: 2, ico: '🌳', name: 'Meesterbrouwer',       max: 5,  base: 8,  grow: 2,   desc: '+3 extra skillpunten per rang.',               eff: n => `+${n * 3} skillpunten`, req: ['h_xp', 3] },
  { id: 'h_auto',  tier: 2, ico: '⚙️', name: 'Automatisering',       max: 2,  base: 5,  grow: 3,   desc: 'Hou verbeteringen bij elke reset.',            eff: n => n >= 2 ? 'zelftap, slok- en bonneke-verbeteringen blijven' : 'zelftap en slokverbeteringen blijven', req: ['h_start', 1] },
  { id: 'h_crate', tier: 2, ico: '📦', name: 'Gulle brouwer',        max: 3,  base: 8,  grow: 2.5, desc: '+1 bier per bak en elke dag een bak extra.',   eff: n => `+${n} bier per bak`, req: ['h_start', 2] },
  { id: 'h_gem',   tier: 3, ico: '💎', name: 'Edelsteenbrouwer',     max: 3,  base: 20, grow: 2.5, desc: 'Parel tot kosmisch ×1,5 per rang.',            eff: n => `×${fmt(Math.pow(1.5, n))} edelstenen`, req: ['h_luck', 3] },
  { id: 'h_dog',   tier: 3, ico: '🐕', name: 'Stamboom',             max: 1,  base: 15, grow: 1,   desc: 'Bobbie blijft bij je, met al zijn levels.',     eff: () => 'Bobbie blijft', req: ['h_staff', 2] },
  { id: 'h_off',   tier: 3, ico: '🌙', name: 'Nachtbrouwerij',       max: 1,  base: 20, grow: 1,   desc: 'Offline op 100% tempo, tot 24 uur.',           eff: () => '100% offline, 24 u', req: ['h_staff', 3] },
  { id: 'h_myth',  tier: 4, ico: '👑', name: "Gambrinus' zegen",     max: 1,  base: 60, grow: 1,   desc: 'Mythisch en goddelijk ×5.',                    eff: () => 'mythisch ×5', req: ['h_gem', 3] },
  { id: 'h_set',   tier: 4, ico: '🧩', name: 'Erfgoedcollectie',     max: 1,  base: 50, grow: 1,   desc: 'Voltooide biertypes en collectiebonussen blijven na een reset.', eff: () => 'biertype-bonussen blijven', req: ['h_crate', 2] },
];
const HOPK = Object.fromEntries(HOP.map(h => [h.id, h]));

// =====================================================================
// ACHIEVEMENTS, QUESTS, CRATES, NEWS
// =====================================================================
// Most achievements pay bonnekes; only the big ones give a bak, krat or vat.
const ACH = [
  { id: 'eerste',     ico: '🍺', name: 'Eerste pint',          desc: 'Drink je eerste pintje',                  ok: s => s.total >= 1 },
  { id: 'stamgast',   ico: '🪑', name: 'Stamgast',             desc: 'Drink zelf 25 pintjes',                   ok: s => s.total >= 25 },
  { id: 'pilier',     ico: '🏛️', name: 'Pilier van de toog',   desc: 'Drink zelf 250 pintjes',                  ok: s => s.total >= 250 },
  { id: 'legende',    ico: '👑', name: 'Levende legende',      desc: 'Drink zelf 1.000 pintjes',                ok: s => s.total >= 1000, crate: 'bak' },
  { id: 'bierbuik',   ico: '🫃', name: 'Bierbuik van staal',   desc: 'Drink zelf 10.000 pintjes',               ok: s => s.total >= 10000, crate: 'krat' },
  { id: 'adfundum',   ico: '⚡', name: 'Ad fundum',            desc: 'Drink een volle pint zonder loslaten',    ok: s => !!s.flags.adfundum },
  { id: 'nonkel',     ico: '🥴', name: 'Zatte nonkel',         desc: 'Drink zelf 5 pintjes op één dag',         ok: s => s.today >= 5 },
  { id: 'nachtuil',   ico: '🦉', name: 'Nachtuil',             desc: 'Drink een pint tussen middernacht en 5 uur', ok: s => !!s.flags.nachtuil },
  { id: 'klikvinger', ico: '👆', name: 'Klikvinger',           desc: 'Tik 1.000 keer op je glas',               ok: s => s.taps >= 1000 },
  { id: 'klikmaniak', ico: '🖐️', name: 'Klikmaniak',           desc: 'Tik 25.000 keer op je glas',              ok: s => s.taps >= 25000, crate: 'bak' },
  { id: 'baas',       ico: '🏪', name: 'Kroegbaas',            desc: 'Neem je eerste personeel aan',            ok: s => bldTotal(s) > 0 },
  { id: 'rentenier',  ico: '🛋️', name: 'Rentenier',            desc: 'Bezit 100 personeelsleden en zaken',      ok: s => bldTotal(s) >= 100 },
  { id: 'magnaat',    ico: '🏙️', name: 'Horecamagnaat',        desc: 'Bezit 500 personeelsleden en zaken',      ok: s => bldTotal(s) >= 500, crate: 'bak' },
  { id: 'miljonair',  ico: '💰', name: 'Bonnekes-miljonair',   desc: 'Verdien in totaal 1 miljoen bonnekes',    ok: s => s.bonAll >= 1e6 },
  { id: 'miljardair', ico: '💎', name: 'Bonnekes-miljardair',  desc: 'Verdien in totaal 1 miljard bonnekes',    ok: s => s.bonAll >= 1e9 },
  { id: 'biljonair',  ico: '🏦', name: 'Bonnekes-biljonair',   desc: 'Verdien in totaal 1 biljoen bonnekes',    ok: s => s.bonAll >= 1e12, crate: 'bak' },
  { id: 'gouddop',    ico: '🧢', name: 'Gouden dop',           desc: 'Vang een gouden bierdop',                 ok: s => s.caps >= 1 },
  { id: 'doppenjager',ico: '🎯', name: 'Doppenjager',          desc: 'Vang 25 gouden doppen',                   ok: s => s.caps >= 25, crate: 'bak' },
  { id: 'nieuwekroeg',ico: '⭐', name: 'Nieuwe kroeg',         desc: 'Open een nieuwe kroeg',                   ok: s => s.stars >= 1 },
  { id: 'sterrenkroeg', ico: '🌟', name: 'Sterrenkroeg',       desc: 'Verzamel 25 kroegsterren',                ok: s => s.stars >= 25, crate: 'krat' },
  { id: 'reeks7',     ico: '📅', name: 'Trouwe klant',         desc: 'Kom 7 dagen na elkaar langs',             ok: s => s.streak >= 7 },
  { id: 'reeks30',    ico: '🗓️', name: 'Meubelstuk',           desc: 'Kom 30 dagen na elkaar langs',            ok: s => s.streak >= 30, crate: 'krat' },
  { id: 'brokken',    ico: '🤮', name: 'Brokkenmaker',         desc: 'Brokkeeeuuuhhh na te veel pintjes',       ok: s => s.pukes >= 1 },
  { id: 'kuisploeg',  ico: '🪣', name: 'Vaste klant van de kuisploeg', desc: 'Brok 10 keer',                ok: s => s.pukes >= 10 },
  { id: 'events25',   ico: '🎲', name: 'Er gebeurt altijd iets', desc: 'Maak 25 voorvallen mee',         ok: s => s.events >= 25 },
  { id: 'quiz10',     ico: '🧠', name: 'Bierprofessor',        desc: 'Beantwoord 10 kroegquizvragen juist',     ok: s => s.quizRight >= 10, crate: 'bak' },
  { id: 'dief5',      ico: '🚓', name: 'Dievenvanger',         desc: 'Vang 5 bonnekesdieven',                   ok: s => s.thieves >= 5 },
  { id: 'brouw1',     ico: '🌿', name: 'Eigen brouwerij',      desc: 'Begin een nieuwe brouwerij (prestige)',   ok: s => s.prestiges >= 1 },
  { id: 'brouw5',     ico: '🏭', name: 'Brouwersdynastie',     desc: 'Begin 5 keer een nieuwe brouwerij',       ok: s => s.prestiges >= 5, crate: 'vat' },
  { id: 'hoptop',     ico: '👑', name: 'Top van de boom',      desc: "Koop Gambrinus' zegen in de brouwerijboom", ok: s => (s.hopTree.h_myth || 0) >= 1 },
  { id: 'seizoen1',   ico: '📅', name: 'Seizoensdrinker',      desc: 'Drink een seizoensbier',                  ok: s => BEERS.some(b => b.season && s.counts[b.id] > 0) },
  { id: 'seizoen5',   ico: '🗓️', name: 'Het hele jaar door',   desc: 'Speel tijdens 5 verschillende seizoenen', ok: s => s.seasonsPlayed.length >= 5, crate: 'krat' },
  { id: 'combo50',    ico: '🔥', name: 'Vingers van vuur',     desc: 'Haal een combo van 50 tikken',            ok: s => s.bestCombo >= 50 },
  { id: 'uitdager',   ico: '⏱️', name: 'Uitdager',             desc: 'Voltooi 10 uitdagingen',                  ok: s => s.challenges >= 10, crate: 'bak' },
  { id: 'bob',        ico: '🚗', name: 'BOB-held',             desc: 'Hou Nonkel Jos uit zijn auto',            ok: s => s.bobs >= 1 },
  { id: 'pong10',     ico: '🏓', name: 'Bierpongkoning',       desc: 'Raak alle 10 bekers in één spelletje',    ok: s => s.pong.clears >= 1, crate: 'bak' },
  { id: 'hond5',      ico: '🐕', name: 'Beste vriend',         desc: 'Breng Bobbie naar level 5',               ok: s => s.dog.lvl >= 5 },
  { id: 'hond20',     ico: '🦮', name: 'Hondenfluisteraar',    desc: 'Breng Bobbie naar level 20',              ok: s => s.dog.lvl >= 20, crate: 'krat' },
  { id: 'gezellig',   ico: '🥂', name: 'Gezelligheid troef',   desc: 'Roep 10 keer Schol! naar andere drinkers', ok: s => s.schols >= 10 },
  { id: 'tapper',     ico: '🎯', name: 'Tapper',               desc: 'Speel de tapwedstrijd',                   ok: s => s.mg.plays >= 1 },
  { id: 'tapkampioen',ico: '🏆', name: 'Tapkampioen',          desc: 'Haal 450 in de tapwedstrijd',             ok: s => s.mg.best >= 450, crate: 'bak' },
  { id: 'perfect',    ico: '💯', name: 'Perfect getapt',       desc: 'Tap 25 perfecte rondes',                  ok: s => s.mg.perfects >= 25 },
  { id: 'dagtaak',    ico: '✅', name: 'Plichtsbewust',        desc: 'Werk alle dagopdrachten van één dag af',  ok: s => s.questDays >= 1 },
  { id: 'opdrachten', ico: '📋', name: 'Werkpaard',            desc: 'Werk 50 dagopdrachten af',                ok: s => s.questsDone >= 50, crate: 'krat' },
  { id: 'kratjes',    ico: '📦', name: 'Kratjesman',           desc: 'Open 25 bakken, kratten of vaten',         ok: s => s.opened >= 25 },
  { id: 'type1',      ico: '🧩', name: 'Eerste biertype',      desc: 'Vervolledig een biertype',                ok: s => s.sets.length >= 1 },
  { id: 'type5',      ico: '🗃️', name: 'Typekenner',           desc: 'Vervolledig 5 biertypes',                 ok: s => s.sets.length >= 5, crate: 'krat' },
  { id: 'edel',       ico: '🤍', name: 'Edelsteenjager',       desc: 'Vind een parel-bier of beter',            ok: s => [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].some(t => hasTier(s, t)) },
  { id: 'juwelier',   ico: '💍', name: 'Juwelier',             desc: 'Vind smaragd, robijn, saffier, amethist én diamant', ok: s => [6, 7, 8, 9, 10].every(t => hasTier(s, t)), crate: 'krat' },
  { id: 'regenboog',  ico: '🌈', name: 'Over de regenboog',    desc: 'Vind een regenboogbier',                  ok: s => hasTier(s, 12), crate: 'krat' },
  { id: 'kosmisch',   ico: '🪐', name: 'Ruimtereiziger',       desc: 'Vind een kosmisch bier',                  ok: s => hasTier(s, 13), crate: 'krat' },
  { id: 'graal',      ico: '✨', name: 'De Heilige Graal',     desc: 'Vind een mythisch bier (0,01%)',          ok: s => hasTier(s, 14), crate: 'vat' },
  { id: 'gambrinus',  ico: '👑', name: 'Gezegend door Gambrinus', desc: 'Vind het goddelijke bier (0,001%)',    ok: s => hasTier(s, 15), crate: 'vat' },
  { id: 'half',       ico: '📖', name: 'Halve collectie',      desc: `Verzamel ${Math.ceil(CORE.length / 2)} soorten`, ok: s => uniqueCount(s) >= Math.ceil(CORE.length / 2), crate: 'krat' },
  { id: 'vol',        ico: '🏆', name: 'Volledige collectie',  desc: `Verzamel alle ${CORE.length} vaste soorten`,   ok: s => uniqueCount(s) >= CORE.length, crate: 'vat' },
];
BUILDINGS.forEach(b => [1, 50, 100].forEach(n => ACH.push({
  id: `b-${b.id}-${n}`, ico: b.ico, name: n === 1 ? `Eerste ${b.name}` : `${n}× ${b.name}`, desc: `Bezit ${n}× ${b.name}`,
  ok: s => (s.bld[b.id] || 0) >= n, bon: b.cost * (n === 1 ? 2 : n === 50 ? 20 : 100),
})));

const CRATES = {
  bak:  { ico: '📦', name: 'Bak',  n: 3,  min: 2, label: 'bak bier' },
  krat: { ico: '🧰', name: 'Krat', n: 6,  min: 4, label: 'krat bier' },
  vat:  { ico: '🛢️', name: 'Vat',  n: 10, min: 6, label: 'vat bier' },
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const QUESTS = {
  drink:  { ico: '🍺', text: g => `Drink zelf ${g} pintjes`, goal: () => pick([5, 8, 12]) },
  tap:    { ico: '👆', text: g => `Tik ${g} keer op je glas`, goal: () => pick([100, 200, 300]) },
  cap:    { ico: '🧢', text: g => `Vang ${g} gouden dop${g > 1 ? 'pen' : ''}`, goal: () => pick([1, 2]) },
  mg:     { ico: '🎯', text: g => `Speel ${g}× de tapwedstrijd`, goal: () => pick([1, 2, 3]) },
  mgscore:{ ico: '💯', text: g => `Haal ${g} punten in één tapwedstrijd`, goal: () => pick([250, 300, 350]), max: true },
  buy:    { ico: '🏪', text: g => `Neem ${g} personeel aan`, goal: () => pick([5, 10, 25]) },
  rare:   { ico: '🔷', text: g => `Drink zelf ${g} zeldzaam bier of beter`, goal: () => pick([1, 2, 3]) },
  pong:   { ico: '🏓', text: g => `Speel ${g}× bierpong`, goal: () => pick([1, 2]) },
  pet:    { ico: '🐶', text: g => `Aai Bobbie ${g} keer`, goal: () => pick([1, 2]) },
  earn:   { ico: '🎟️', text: g => `Verdien ${fmt(g)} bonnekes`, goal: () => Math.max(1000, Math.round(staffIncome() * 900 / 100) * 100) },
};

const TOASTS = ['Schol!', 'Santé!', 'Gezondheid!', 'Op ons!', 'Ad fundum!', 'Nog ene en dan naar huis…', 'Proost, maat!', 'Da was er ene!', 'Op de goeie afloop!', 'Allez, nog een rondje!'];
const NEWS = [
  { t: 'Lokaal café meldt record: iemand drinkt een pintje. Zonder pauze.' },
  { t: 'Weerbericht: kans op schuim 80%, later opklaringen met een tripel.' },
  { t: 'Peiling: 9 op 10 Belgen verkiezen een pintje boven werk. De tiende zat op café.' },
  { t: 'Wetenschappers: "Een gouden bierdop is geen geldig betaalmiddel." Niemand luistert.' },
  { t: 'Belgische biercultuur staat sinds 2016 op de Unesco-lijst. Het café ernaast ook, volgens de stamgasten.' },
  { t: 'Tapper uit Leuven: "Twee vingers schuim, niet meer, niet minder."' },
  { t: 'Brouwers bezorgd: "Er is genoeg bier," zegt woordvoerder. "Voorlopig."', ok: s => s.total >= 20 },
  { t: 'Rietjesfabriek draait overuren.', ok: s => (s.bld.rietje || 0) >= 5 },
  { t: 'Stamgasten weigeren naar huis te gaan: "We zijn hier voor de collectie."', ok: s => (s.bld.stamgast || 0) >= 1 },
  { t: 'Nonkel Jos gesignaleerd op drie familiefeesten tegelijk.', ok: s => (s.bld.nonkel || 0) >= 1 },
  { t: 'Cantus loopt uit: "We zijn pas aan lied 47."', ok: s => (s.bld.studenten || 0) >= 1 },
  { t: 'Smoutebollenkraam klaagt: niemand eet nog, iedereen drinkt.', ok: s => (s.bld.kermis || 0) >= 1 },
  { t: 'Festivalganger vindt eindelijk de toog. Hij stond er al drie dagen naast.', ok: s => (s.bld.festival || 0) >= 1 },
  { t: 'Monniken vragen meer gebedstijd. Tussen twee brouwsels door.', ok: s => (s.bld.abdij || 0) >= 1 },
  { t: 'Brugge bevestigt: bierpijpleiding loopt nu ook onder Gent door.', ok: s => (s.bld.pijp || 0) >= 1 },
  { t: 'Sint-Arnoldus gezien met een rondje voor het hele hemelrijk.', ok: s => (s.bld.hemel || 0) >= 1 },
  { t: 'Bierbaron koopt de maan. "Voor de schaduw op het terras."', ok: s => (s.bld.baron || 0) >= 1 },
  { t: 'Bierportaal per ongeluk geopend naar een café in 1958. Prijzen daar: verdacht laag.', ok: s => (s.bld.portaal || 0) >= 1 },
  { t: 'Tijdtap levert pintjes van volgende week. Ze zijn al lauw.', ok: s => (s.bld.tijd || 0) >= 1 },
  { t: 'Sterrenkundigen ontdekken nieuw sterrenbeeld: De Grote Pint.', ok: s => (s.bld.kosmos || 0) >= 1 },
  { t: 'Gambrinus spreekt het volk toe: "Schol."', ok: s => (s.bld.gambrinus || 0) >= 1 },
  { t: 'Westvleteren verhoogt de beveiliging na mysterieuze verdwijningen.', ok: s => (s.counts.westvleteren || 0) >= 3 },
  { t: 'Juweliers in Antwerpen verbaasd: klanten vragen naar smaragden… in een glas.', ok: s => hasTier(s, 6) },
  { t: 'Regenboog boven België. Experts: "Iemand heeft hem leeggedronken."', ok: s => hasTier(s, 12) },
  { t: 'Kroegbaas opent nieuwe kroeg. De stamgasten verhuizen gewoon mee.', ok: s => s.stars >= 1 },
  { t: 'Economen: bonnekes nu sterker dan de euro.', ok: s => s.bonAll >= 1e7 },
  { t: 'Kuisploeg opgeroepen naar plaatselijk café: "Het was weer zover."', ok: s => s.pukes >= 1 },
  { t: 'Dokter waarschuwt: "Na tien pintjes wordt alles een gok."', ok: s => s.today >= 8 },
  { t: 'Tapwedstrijd: jury noemt schuimkraag "bijna poëtisch".', ok: s => s.mg.best >= 400 },
  { t: 'Caféhond Bobbie verkozen tot Hond van het Jaar. Hij was de enige kandidaat.', ok: s => s.dog.lvl >= 3 },
  { t: 'Bierpongtornooi: winnaar raakte alle bekers en daarna de deur.', ok: s => s.pong.best >= 6 },
  { t: 'Happy hour verlengd tot "zolang het duurt".' },
  { t: 'Nieuwe brouwerij geopend in het dorp. De brouwer komt je bekend voor.', ok: s => s.prestiges >= 1 },
  { t: 'Herfstbierfeesten: brouwers zweren dat de bladeren dit jaar extra goed vallen.', ok: () => seasonActive('herfst') },
  { t: 'Spook gesignaleerd in de kelder. Het wou enkel een pompoenbier.', ok: () => seasonActive('halloween') },
  { t: 'De Sint vraagt of je braaf geweest bent. Je zatheidsmeter zegt van niet.', ok: () => seasonActive('sinterklaas') },
  { t: 'Kerstmarkt opent: glühkriek nu ook in een vaasje.', ok: () => seasonActive('kerst') },
  { t: 'Vuurwerk boven het café. De stamgasten applaudisseren voor elke pint.', ok: () => seasonActive('nieuwjaar') },
  { t: 'Carnavalsstoet trekt door het dorp. Iemand verkleed als Westvleteren-krat.', ok: () => seasonActive('carnaval') },
  { t: 'Paashaas betrapt met een bak bier onder de arm.', ok: () => seasonActive('lente') },
  { t: 'Terrasjesweer! Gemeente overweegt het café uit te breiden tot op het dorpsplein.', ok: () => seasonActive('zomer') },
  { t: '21 juli: defilé passeert, iedereen stopt even voor een pintje.', ok: () => seasonActive('nationale') },
  { t: 'BOB-campagne meldt record: iedereen in het café wil de BOB zijn. Behalve Nonkel Jos.' },
  { t: 'Plaatselijke frituur zit zonder stoofvleessaus. Paniek in het dorp.' },
  { t: 'Man tikt zo snel op zijn pint dat zijn gsm vlam vat.', ok: s => s.bestCombo >= 30 },
  { t: 'Alcoholcontrole aan het café. Iedereen blijkt te voet.', ok: s => s.events >= 1 },
  { t: 'Bonnekesdief opgepakt: "Ik wou gewoon een pintje."', ok: s => s.thieves >= 1 },
  { t: 'Stroompanne in het dorp. Café draait gewoon door bij kaarslicht.', ok: s => s.events >= 3 },
  { t: 'Kroegquiz: niemand weet hoe lambiek gist. Behalve één stamgast.', ok: s => s.quizRight >= 1 },
];
