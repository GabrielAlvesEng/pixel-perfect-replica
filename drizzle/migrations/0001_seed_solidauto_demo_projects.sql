-- ============ PROJETOS ============
insert into public.projects (id, code, title1, title2, order_no, status, read_at, created_at, updated_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-00-00-000','Proteção de Gradil Prensas','INCA','4512','em_andamento', now() - interval '2 hours', now() - interval '3 days', now()),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-00-00-000','Suporte de Plataforma Pneumática','Metalúrgica Vale','4478','em_andamento', now() - interval '2 days', now() - interval '10 days', now() - interval '3 days'),
  ('aaaaaaaa-0000-0000-0000-000000000003','26-01-001-00-00-000','Estrutura de Caldeira Horizontal','Termoaço','4390','lido', now() - interval '9 days', now() - interval '20 days', now() - interval '9 days');

-- ============ ARVORE ============
insert into public.project_nodes (id, project_id, parent_id, code, node_type, title3, qty_parent, qty_total, status, position) values
  ('bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', null,'26-060-PGP-00-00-000','Montagem','Montagem geral',1,1,'ok',1),
  ('bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','26-060-PGP-0A-00-000','Montagem','Gradil lado A',1,1,'ok',2),
  ('bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002','26-060-PGP-0A-01-000','Montagem','Painel fixo',2,2,'aviso',3),
  ('bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002','26-060-PGP-0A-02-000','Montagem','Porta de acesso',1,1,'ok',4),
  ('bbbbbbbb-0000-0000-0000-000000000005','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000004','26-060-PGP-0A-02-001','Soldagem','Quadro da porta',1,1,'erro',5),
  ('bbbbbbbb-0000-0000-0000-000000000006','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000004','26-060-PGP-0A-02-002','Soldagem','Batente',2,2,'ok',6),
  ('bbbbbbbb-0000-0000-0000-000000000007','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','26-060-PGP-0B-00-000','Montagem','Gradil lado B',1,1,'ok',7),
  ('bbbbbbbb-0000-0000-0000-000000000008','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000007','26-060-PGP-0B-01-001','Soldagem','Coluna',4,4,'ok',8),
  ('bbbbbbbb-0000-0000-0000-000000000009','aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000007','26-060-PGP-0B-01-002','Soldagem','',2,2,'aviso',9),
  ('bbbbbbbb-0000-0000-0000-000000000011','aaaaaaaa-0000-0000-0000-000000000002', null,'26-038-SPP-00-00-000','Montagem','Montagem geral',1,1,'ok',1),
  ('bbbbbbbb-0000-0000-0000-000000000012','aaaaaaaa-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000011','26-038-SPP-0A-00-000','Montagem','Estrutura superior',1,1,'ok',2),
  ('bbbbbbbb-0000-0000-0000-000000000013','aaaaaaaa-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000012','26-038-SPP-0A-01-001','Soldagem','Travessa',2,2,'ok',3),
  ('bbbbbbbb-0000-0000-0000-000000000014','aaaaaaaa-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000012','26-038-SPP-0A-01-002','Soldagem','Coluna',4,4,'ok',4),
  ('bbbbbbbb-0000-0000-0000-000000000015','aaaaaaaa-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000011','26-038-SPP-0B-00-000','Montagem','Base',1,1,'ok',5),
  ('bbbbbbbb-0000-0000-0000-000000000016','aaaaaaaa-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000015','26-038-SPP-0B-01-001','Soldagem','Chapa base',2,2,'aviso',6),
  ('bbbbbbbb-0000-0000-0000-000000000021','aaaaaaaa-0000-0000-0000-000000000003', null,'26-01-001-00-00-000','Montagem','Montagem geral',1,1,'ok',1),
  ('bbbbbbbb-0000-0000-0000-000000000022','aaaaaaaa-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000021','26-01-001-0A-00-000','Montagem','Anel de reforço',1,1,'ok',2),
  ('bbbbbbbb-0000-0000-0000-000000000023','aaaaaaaa-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000022','26-01-001-0A-01-001','Soldagem','Costela',8,8,'ok',3),
  ('bbbbbbbb-0000-0000-0000-000000000024','aaaaaaaa-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000021','26-01-001-0B-00-000','Montagem','Suporte de tubo',1,1,'ok',4),
  ('bbbbbbbb-0000-0000-0000-000000000025','aaaaaaaa-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000024','26-01-001-0B-01-001','Soldagem','Berce',6,6,'erro',5);

-- ============ COMERCIAIS E REFERENCIAS ============
insert into public.project_items (project_id, name, file, folder, qty, item_type, kind, position) values
  ('aaaaaaaa-0000-0000-0000-000000000001','Parafuso sextavado M12','PAR-SEX-M12x40.SLDPRT','Biblioteca\Fixadores',48,'Peça','CM',1),
  ('aaaaaaaa-0000-0000-0000-000000000001','Motor WEG 5cv','WEG-W22-5CV.SLDASM','Biblioteca\Motores',1,'Montagem','CM',2),
  ('aaaaaaaa-0000-0000-0000-000000000001','Prensa (referência)','PRENSA-REF.SLDASM','Cliente\INCA',2,'Montagem','REF',3),
  ('aaaaaaaa-0000-0000-0000-000000000001','Cilindro pneumático','CIL-PN-63x200.SLDASM','Biblioteca\Pneumática',2,'Montagem','CM',4),
  ('aaaaaaaa-0000-0000-0000-000000000001','Chapa de fechamento','CHAPA-FECH-3MM.SLDPRT','Projeto\26-060',6,'Peça','Projeto',5),
  ('aaaaaaaa-0000-0000-0000-000000000001','Porca sextavada M12','POR-SEX-M12.SLDPRT','Biblioteca\Fixadores',48,'Peça','CM',6),
  ('aaaaaaaa-0000-0000-0000-000000000002','Parafuso sextavado M16','PAR-SEX-M16x50.SLDPRT','Biblioteca\Fixadores',24,'Peça','CM',1),
  ('aaaaaaaa-0000-0000-0000-000000000002','Motor WEG 3cv','WEG-W22-3CV.SLDASM','Biblioteca\Motores',1,'Montagem','CM',2),
  ('aaaaaaaa-0000-0000-0000-000000000002','Válvula 5/2','VAL-52-14.SLDPRT','Biblioteca\Pneumática',2,'Peça','CM',3),
  ('aaaaaaaa-0000-0000-0000-000000000003','Chapa de reforço','CHAPA-REF-635.SLDPRT','Projeto\26-001',8,'Peça','Projeto',1),
  ('aaaaaaaa-0000-0000-0000-000000000003','Junta de expansão','JUNTA-EXP-DN300.SLDPRT','Biblioteca\Tubulação',4,'Peça','CM',2);

-- ============ VERIFICACOES ============
insert into public.project_checks (project_id, severity, code, message) values
  ('aaaaaaaa-0000-0000-0000-000000000001','erro','26-060-PGP-0A-02-001','Código de soldagem em uma montagem'),
  ('aaaaaaaa-0000-0000-0000-000000000001','erro','26-060-PGP-0B-01-003','Arquivo referenciado não encontrado'),
  ('aaaaaaaa-0000-0000-0000-000000000001','aviso','26-060-PGP-0B-01-002','Propriedade 10-TITULO 3 vazia'),
  ('aaaaaaaa-0000-0000-0000-000000000001','aviso','26-060-PGP-0A-01-000','Quantidade no pai diferente da última leitura'),
  ('aaaaaaaa-0000-0000-0000-000000000001','aviso','PAR-SEX-M12x40','Item comercial sem código de compra'),
  ('aaaaaaaa-0000-0000-0000-000000000001','ok','26-060-PGP-00-00-000','Propriedades da montagem geral completas'),
  ('aaaaaaaa-0000-0000-0000-000000000001','ok','26-060-PGP-0B-00-000','Estrutura de códigos consistente'),
  ('aaaaaaaa-0000-0000-0000-000000000001','ok','26-060-PGP-0A-02-000','Quantidades conferidas'),
  ('aaaaaaaa-0000-0000-0000-000000000002','erro','26-038-SPP-0B-01-001','Chapa base sem espessura definida'),
  ('aaaaaaaa-0000-0000-0000-000000000002','aviso','26-038-SPP-0B-01-001','Propriedade 10-TITULO 3 repetida'),
  ('aaaaaaaa-0000-0000-0000-000000000002','ok','26-038-SPP-00-00-000','Propriedades da montagem geral completas'),
  ('aaaaaaaa-0000-0000-0000-000000000003','erro','26-01-001-0B-01-001','Berce com código fora da estrutura'),
  ('aaaaaaaa-0000-0000-0000-000000000003','aviso','26-01-001-0A-01-001','Quantidade no pai diferente da última leitura'),
  ('aaaaaaaa-0000-0000-0000-000000000003','ok','26-01-001-00-00-000','Propriedades da montagem geral completas');

-- ============ LISTA DE CORTE ============
insert into public.cut_items (project_id, weld_code, weld_title, pos, profile, material, length_mm, qty, kgm, status, position) values
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-02-001','Quadro da porta','01','Tubo quadrado 50×50×2,65','SAE 1020',2100,2,3.93,'ok',1),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-02-001','Quadro da porta','02','Tubo quadrado 50×50×2,65','SAE 1020',1060,2,3.93,'ok',2),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-02-001','Quadro da porta','03','Barra chata 1¼″×¼″','ASTM A36',980,3,1.58,'aviso',3),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-02-002','Batente','01','Cantoneira 2″×3/16″','ASTM A36',2150,1,3.63,'ok',4),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0B-01-001','Coluna','01','Perfil W 150×13','ASTM A572 Gr50',2400,1,13.00,'ok',5),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0B-01-001','Coluna','02','Chapa base 200×200','ASTM A36',200,1,15.70,'ok',6),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-0A-01-001','Travessa','01','Tubo retangular 80×40×2,65','SAE 1020',1850,2,4.60,'ok',1),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-0A-01-002','Coluna','01','Perfil W 150×13','ASTM A572 Gr50',2600,4,13.00,'ok',2),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-0B-01-001','Chapa base','01','Chapa base 300×300','ASTM A36',300,2,23.60,'aviso',3),
  ('aaaaaaaa-0000-0000-0000-000000000003','26-01-001-0A-01-001','Costela','01','Barra chata 100×6','ASTM A36',720,8,4.71,'ok',1),
  ('aaaaaaaa-0000-0000-0000-000000000003','26-01-001-0B-01-001','Berce','01','Cantoneira 3″×1/4″','ASTM A36',640,6,4.98,'erro',2);

-- ============ CHAPAS ============
insert into public.sheets (project_id, material, thickness, code, name, w_mm, h_mm, qty, holes, shape, position) values
  ('aaaaaaaa-0000-0000-0000-000000000001','ASTM A36','3,00 mm','26-060-PGP-0A-01-003','Chapa de fechamento',980,620,6,4,'rect',1),
  ('aaaaaaaa-0000-0000-0000-000000000001','ASTM A36','3,00 mm','26-060-PGP-0A-02-004','Reforço da porta',420,180,2,2,'l',2),
  ('aaaaaaaa-0000-0000-0000-000000000001','ASTM A36','6,35 mm','26-060-PGP-0B-01-005','Chapa base da coluna',200,200,4,4,'flange',3),
  ('aaaaaaaa-0000-0000-0000-000000000001','ASTM A36','6,35 mm','26-060-PGP-0B-01-006','Mão-francesa',150,150,8,0,'gusset',4),
  ('aaaaaaaa-0000-0000-0000-000000000001','Inox AISI 304','2,00 mm','26-060-PGP-0A-01-007','Placa de identificação',160,90,2,4,'rect',5),
  ('aaaaaaaa-0000-0000-0000-000000000002','ASTM A36','6,35 mm','26-038-SPP-0B-01-003','Chapa base',300,300,2,4,'flange',1),
  ('aaaaaaaa-0000-0000-0000-000000000002','ASTM A36','3,00 mm','26-038-SPP-0A-01-004','Reforço da travessa',260,140,4,2,'l',2),
  ('aaaaaaaa-0000-0000-0000-000000000003','ASTM A36','6,35 mm','26-01-001-0A-01-002','Costela',720,100,8,0,'gusset',1),
  ('aaaaaaaa-0000-0000-0000-000000000003','ASTM A36','9,53 mm','26-01-001-0B-01-002','Berce',640,180,6,2,'l',2);

-- ============ LISTAS DE MATERIAIS ============
insert into public.material_items (project_id, assembly, title, item, description, spec, unit, qty, position) values
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-00-000','Gradil lado A','PAR-SEX-M12x40','Parafuso sextavado M12 × 40','Classe 8.8 zincado','pç',24,1),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-00-000','Gradil lado A','POR-SEX-M12','Porca sextavada M12','Classe 8 zincada','pç',24,2),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-00-000','Gradil lado A','DOB-INOX-3','Dobradiça industrial 3″','Inox 304','pç',3,3),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0A-00-000','Gradil lado A','FEC-MAG-01','Fecho de segurança com sensor','Schmersal AZM','pç',1,4),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0B-00-000','Gradil lado B','PAR-SEX-M12x40','Parafuso sextavado M12 × 40','Classe 8.8 zincado','pç',24,5),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0B-00-000','Gradil lado B','POR-SEX-M12','Porca sextavada M12','Classe 8 zincada','pç',24,6),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-0B-00-000','Gradil lado B','CHB-M16','Chumbador químico M16','Hilti HAS-U','pç',16,7),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-00-00-000','Montagem geral','WEG-W22-5CV','Motor WEG W22 5 cv','4 polos, 220/380 V','pç',1,8),
  ('aaaaaaaa-0000-0000-0000-000000000001','26-060-PGP-00-00-000','Montagem geral','CIL-PN-63x200','Cilindro pneumático Ø63 × 200','ISO 15552','pç',2,9),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-0A-00-000','Estrutura superior','PAR-SEX-M16x50','Parafuso sextavado M16 × 50','Classe 8.8 zincado','pç',24,1),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-0B-00-000','Base','CHB-M16','Chumbador químico M16','Hilti HAS-U','pç',8,2),
  ('aaaaaaaa-0000-0000-0000-000000000002','26-038-SPP-00-00-000','Montagem geral','VAL-52-14','Válvula solenoide 5/2','1/4″, 24 Vdc','pç',2,3),
  ('aaaaaaaa-0000-0000-0000-000000000003','26-01-001-0A-00-000','Anel de reforço','JUNTA-EXP-DN300','Junta de expansão DN300','EPDM, PN10','pç',4,1),
  ('aaaaaaaa-0000-0000-0000-000000000003','26-01-001-0B-00-000','Suporte de tubo','CHB-M20','Chumbador químico M20','Hilti HAS-U','pç',12,2);