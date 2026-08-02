import { Question } from '../types';

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // ZONE 1: พิกัดอันตราย (การจดจำ & ระบุภัยคุกคาม) - EASY
  // ==========================================
  {
    id: 101,
    zone: 1,
    category: 'Phishing Detection',
    difficulty: 'easy',
    points: 100,
    question: 'สังเกตอีเมลแจ้งเตือนด้านล่าง ข้อใดเป็นสัญญาณเตือน (Red Flag) ชัดเจนที่สุดว่าเป็น Phishing Email?',
    scenarioContext: {
      type: 'email',
      header: 'FROM: security-alert@paypa1-support-sec.com | SUBJECT: [URGENT] บัญชีของคุณถูกระงับ!',
      content: 'เรียนผู้ใช้งาน, บัญชีของคุณถูกระงับชั่วคราวเนื่องจากตรวจพบการเข้าถึงที่ไม่ปลอดภัย กรุณคลิกลิงก์ด้านล่างเพื่อยืนยันตัวตนภายใน 15 นาที มิฉะนั้นบัญชีจะถูกลบถาวร: http://paypa1-login-check.biz/verify'
    },
    options: [
      'โดเมนอีเมลผู้ส่งผิดปกติ (paypa1-support-sec.com) และสร้างความตื่นตระหนกเร่งด่วน',
      'อีเมลส่งมาในช่วงเวลาทำงาน',
      'มีข้อความภาษาไทยในอีเมล',
      'มีปุ่มและลิงก์ให้คลิก'
    ],
    correctAnswer: 0,
    explanation: 'Phishing Email มักใช้โดเมนสะกดเลียนแบบ (เช่น paypa1 ใช้ตัวเลข 1 แทน L) และใช้เทคนิคเร่งด่วนสร้างความกลัวให้รีบกดลิงก์ปลอม',
    hint: 'พิจารณาชื่อโดเมนผู้ส่งหลังเครื่องหมาย @ และระดับความเร่งด่วนของข้อความ'
  },
  {
    id: 102,
    zone: 1,
    category: 'Strong Passwords',
    difficulty: 'easy',
    points: 100,
    question: 'รหัสผ่านในข้อใดต่อไปนี้ ปลอดภัยและรัดกุมที่สุดตามมาตรฐานภัยไซเบอร์ปัจจุบัน?',
    options: [
      'P@ssw0rd2026!',
      'Kmutnb#9982$',
      'cYb3r#S3cur3!D@t@2026',
      '1234567890qwerty'
    ],
    correctAnswer: 2,
    explanation: 'รหัสผ่านที่ดีควรมีความยาวเกิน 12-16 ตัวอักษร ผสมผสานตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์พิเศษ และไม่ใช้คำในพจนานุกรม หรือข้อมูลส่วนตัวที่คาดเดาง่าย',
    hint: 'เลือกข้อที่มีความยาวมากที่สุดและมีความซับซ้อนผสมหลายประเภทตัวอักษร'
  },
  {
    id: 103,
    zone: 1,
    category: 'Authentication',
    difficulty: 'easy',
    points: 100,
    question: 'การยืนยันตัวตนแบบสองปัจจัย (2FA / Multi-Factor Authentication) ข้อใดกล่าวถูกต้องที่สุด?',
    options: [
      'ใช้รหัสผ่านเดียวยาวๆ โดยไม่ต้องเปิดระบบยืนยันตัวตนอื่น',
      'เพิ่มความปลอดภัยโดยใช้องค์ประกอบ 2 ใน 3 อย่าง (สิ่งที่รู้, สิ่งที่มี, สิ่งที่เป็น)',
      'คือการเปลี่ยนรหัสผ่านทุกๆ 7 วัน',
      'ป้องกันแฮกเกอร์ได้ 100% โดยไม่ต้องระมัดระวังเรื่องอื่น'
    ],
    correctAnswer: 1,
    explanation: '2FA ผสานการยืนยันตัวตนจาก 2 ปัจจัยที่แตกต่างกัน เช่น Password (สิ่งที่รู้) + Authenticator App/OTP (สิ่งที่มี) หรือ Scan นิ้วมือ (สิ่งที่เป็น)',
    hint: '2FA ย่อมาจาก Two-Factor Authentication หมายถึงการมีกลไกตรวจสอบ 2 ชั้น'
  },
  {
    id: 104,
    zone: 1,
    category: 'Web Security',
    difficulty: 'easy',
    points: 100,
    question: 'เมื่อคุณทำธุรกรรมการเงินผ่านเว็บบราวเซอร์ สัญลักษณ์รูป "แม่กุญแจ" และโปรโตคอล "https://" บน URL Bar หมายถึงอะไร?',
    options: [
      'เว็บไซต์นี้เป็นของแท้ 100% ไม่มีทางเป็นเว็บหลอกลวง',
      'ข้อมูลที่ส่งระหว่างบราวเซอร์กับเซิร์ฟเวอร์ได้รับการเข้ารหัส (SSL/TLS Encryption)',
      'เครื่องคอมพิวเตอร์ของคุณไม่มีไวรัสหรือมัลแวร์แน่นอน',
      'แฮกเกอร์ไม่สามารถโจมตีระบบของเว็บไซต์นั้นได้เลย'
    ],
    correctAnswer: 1,
    explanation: 'HTTPS และสัญลักษณ์แม่กุญแจหมายความว่า ข้อมูลจราจรคอมพิวเตอร์ระหว่างคุณกับเว็บไซต์ถูกเข้ารหัสไว้ ป้องกันการดักรับข้อมูล (Eavesdropping) แต่ไม่ได้การันตีว่าเนื้อหาในเว็บจะไม่ใช่เว็บ Phishing',
    hint: 'HTTPS เน้นเรื่องการเข้ารหัสช่องทางสื่อสาร (Encryption in transit)'
  },
  {
    id: 105,
    zone: 1,
    category: 'Malware Basics',
    difficulty: 'easy',
    points: 100,
    question: 'มัลแวร์ชนิดใดที่มีพฤติกรรมเข้ารหัสไฟล์ข้อมูลในเครื่องเหยื่อ แล้วขู่เรียกเงินไถ่เพื่อแลกกับคีย์ปลดล็อก?',
    options: [
      'Spyware',
      'Adware',
      'Ransomware',
      'Trojan Horse'
    ],
    correctAnswer: 2,
    explanation: 'Ransomware (มัลแวร์เรียกค่าไถ่) จะทำลายความพร้อมใช้งานของข้อมูลโดยเข้ารหัสไฟล์ทั้งหมด และแสดงข้อความขู่ให้โอนเงินคริปโตเพื่อไถ่คีย์',
    hint: 'คำว่า Ransom ในภาษาอังกฤษแปลว่า "ค่าไถ่"'
  },

  // ==========================================
  // ZONE 2: ถอดรหัสภัยคุกคาม (การเข้าใจ & วิเคราะห์) - MEDIUM
  // ==========================================
  {
    id: 201,
    zone: 2,
    category: 'Public Wi-Fi Security',
    difficulty: 'medium',
    points: 150,
    question: 'คุณจำเป็นต้องเชื่อมต่อ Wi-Fi สาธารณะฟรีที่สนามบินเพื่อเข้าใช้งานระบบบัญชีบริษัท ข้อใดคือวิธีปฏิบัติตัวที่ปลอดภัยที่สุด?',
    scenarioContext: {
      type: 'alert',
      header: 'NETWORK DETECTED: Free_Airport_HighSpeed_WiFi',
      content: 'คำเตือนระบบ: เครือข่าย Wi-Fi นี้ไม่มีการใส่รหัสผ่าน มีความเสี่ยงต่อการถูก Man-in-the-Middle Attack ดักจับข้อมูล'
    },
    options: [
      'ใช้งานได้ทันทีเพราะชื่อ Wi-Fi น่าเชื่อถือ',
      'เปิดใช้งาน VPN (Virtual Private Network) ก่อนเข้าใช้งานระบบสำคัญหรือธุรกรรม',
      'ปิดโปรแกรม Scan Virus เพื่อให้ Wi-Fi เร็วขึ้น',
      'ใช้โหมดอ่านแบบส่วนตัว (Incognito Mode) ก็เพียงพอแล้ว'
    ],
    correctAnswer: 1,
    explanation: 'VPN จะทำการสร้าง อุโมงค์เข้ารหัส (Encrypted Tunnel) ครอบข้อมูลการใช้งานทั้งหมด ป้องกันการถูกทำ Man-in-the-Middle (MitM) หรือดักแพ็กเก็ตข้อมูลบน Wi-Fi สาธารณะ',
    hint: 'การเชื่อมต่อ Wi-Fi ที่ไร้การเข้ารหัสต้องอาศัยเทคโนโลยีสร้างอุโมงค์สื่อสารส่วนตัว'
  },
  {
    id: 202,
    zone: 2,
    category: 'Social Engineering',
    difficulty: 'medium',
    points: 150,
    question: 'มีสายโทรศัพท์อ้างว่าเป็น "เจ้าหน้าที่ฝ่ายไอทีขององค์กร" บอกว่าเซิร์ฟเวอร์เกิดปัญหาวิกฤต และขอให้คุณบอก OTP ที่พึ่งส่งเข้ามือถือคุณเพื่อแก้ไขระบบทันที คุณควรทำอย่างไร?',
    scenarioContext: {
      type: 'alert',
      header: 'INCOMING CALL: IT Support Desk (Unknown Number)',
      content: '"สวัสดีครับคุณแอดมิน ตอนนี้ระบบ Data Center มีการ Breach ร้ายแรง กรุณาบอกรหัส OTP 6 หลักที่ได้รับทาง SMS เดี๋ยวนี้ ไม่งั้นข้อมูลทั้งหมดจะสูญหาย!"'
    },
    options: [
      'บอก OTP ทันทีเพื่อช่วยกู้วิกฤตระบบ',
      'ปฏิเสธการให้ OTP ทันที วางสาย แล้วโทรกลับหาฝ่าย IT ผ่านเบอร์ติดต่อภายในอย่างเป็นทางการเพื่อตรวจสอบ',
      'โพสต์ลงโซเชียลมีเดียถามเพื่อนร่วมงานว่ามีใครโดนโทรหาบ้าง',
      'ส่ง OTP ทางไลน์แทนการพูดสาย'
    ],
    correctAnswer: 1,
    explanation: 'นี่คือการโจมตีแบบ Vishing (Voice Phishing / Social Engineering) เจ้าหน้าที่ไอทีจริงจะไม่มีวันขอ OTP หรือรหัสผ่านส่วนตัวของผู้ใช้เด็ดขาด',
    hint: 'รหัส OTP คือความลับเฉพาะบุคคลที่ไม่ควรมอบให้ใครไม่ว่ากรณีใดๆ'
  },
  {
    id: 203,
    zone: 2,
    category: 'Physical Security',
    difficulty: 'medium',
    points: 150,
    question: 'คุณพบแฟลชไดรฟ์ (USB Flash Drive) นิรนามตกอยู่ที่พื้นลานจอดรถของ Data Center มีป้ายเขียนว่า "Confidential_Salaries_2026.xlsx" การกระทำใดถูกต้องที่สุด?',
    options: [
      'นำไปเสียบเข้าคอมพิวเตอร์บริษัทเพื่อหาเจ้าของ',
      'นำไปเสียบกับคอมพิวเตอร์ส่วนตัวที่บ้านแทน',
      'ห้ามนำไปเสียบกับเครื่องใดๆ เด็ดขาด นำส่งฝ่ายความปลอดภัยไซเบอร์ (Cyber Security Team)',
      'ลองเปิดดูเฉพาะไฟล์ที่เป็นรูปภาพ'
    ],
    correctAnswer: 2,
    explanation: 'การกระทำนี้คือเทคนิค "Baiting" แฮกเกอร์มักตั้งใจทิ้ง USB ติดมัลแวร์ไว้ หากนำไปเสียบ มัลแวร์จะรันตัวเองอัตโนมัติ (เช่น USB Rubber Ducky) โจมตีระบบทันที',
    hint: 'อุปกรณ์เชื่อมต่อภายนอกที่ไม่ทราบที่มาคือพาหะนำมัลแวร์อันตราย'
  },
  {
    id: 204,
    zone: 2,
    category: 'Terminal Analysis',
    difficulty: 'medium',
    points: 150,
    question: 'พิจารณา Log ข้อผิดพลาดของระบบเซิร์ฟเวอร์ด้านล่าง ข้อใดอธิบายสถานการณ์ที่เกิดขึ้นได้ถูกต้องที่สุด?',
    scenarioContext: {
      type: 'terminal',
      header: 'DARK DATA CENTER AUDIT LOG #908',
      content: '[03:14:22] WARN: 14,200 Failed Login Attempts detected for user "admin"\n[03:14:23] WARN: IP 185.220.101.5 trying combinations from dictionary_v2.txt\n[03:14:25] ALERT: Multiple failed SSH authentication attempts within 3 seconds!'
    },
    options: [
      'ระบบกำลังทำการสำรองข้อมูลอัตโนมัติประจำวัน',
      'เซิร์ฟเวอร์กำลังถูกโจมตีแบบ Brute Force / Dictionary Attack เพื่อสุ่มเดารหัสผ่าน',
      'ผู้ใช้งานลืมรหัสผ่านและกำลังพยายามสุ่มเข้าใช้งานตามปกติ',
      'มีการส่งพัสดุข้อมูลเกินขนาดแบบ DDoS Attack'
    ],
    correctAnswer: 1,
    explanation: 'Log แสดงการพยายามเข้าสู่ระบบล้มเหลวจำนวนหมื่นครั้งในเวลาอันสั้นด้วยคลังคำศัพท์ (Dictionary) ชี้ชัดว่ากำลังถูก Brute Force Attack',
    hint: 'จำนวนการพยายามเข้าสู่ระบบที่ถี่และมากผิดปกติควบคู่กับคลังคำศัพท์คือลักษณะเฉพาะของการสุ่มรหัสผ่าน'
  },
  {
    id: 205,
    zone: 2,
    category: 'Data Backup',
    difficulty: 'medium',
    points: 150,
    question: 'หลักการสำรองข้อมูลแบบ 3-2-1 Rule เพื่อรับมือกับ Ransomware และภัยพิบัติไซเบอร์ ประกอบด้วยอะไรบ้าง?',
    options: [
      'สำรอง 3 วันครั้ง, ใช้ 2 รหัสผ่าน, เก็บ 1 เดือน',
      'เก็บข้อมูล 3 สำเนา, บนสื่อบันทึก 2 ประเภทที่ต่างกัน, และ 1 สำเนานอกสถานที่/ออฟไลน์ (Offsite/Air-Gapped)',
      'สำรอง 3 โฟลเดอร์, ใน 2 คอมพิวเตอร์, ส่ง 1 อีเมล',
      'ใช้อาร์ดดิสก์ 3 ลูก, แฟลชไดรฟ์ 2 อัน, คลาวด์ 1 แห่ง'
    ],
    correctAnswer: 1,
    explanation: 'กฎ 3-2-1 คือมาตรฐานทองคำ: สำรองข้อมูลรวมอย่างน้อย 3 ชุด (ต้นฉบับ+2สำเนา), บันทึกบนสื่อต่างประเภทกัน 2 ชนิด (เช่น SSD + Cloud), และเก็บ 1 ชุดแยกออฟไลน์',
    hint: 'นึกถึงความหลากหลายของสื่อบันทึกและการแยกเก็บออฟไลน์ป้องกัน Ransomware ลุกลาม'
  },

  // ==========================================
  // ZONE 3: เอาชีวิตรอดในระบบจริง (สถานการณ์จำลอง & การตัดสินใจ) - HARD
  // ==========================================
  {
    id: 301,
    zone: 3,
    category: 'Incident Response Scenario',
    difficulty: 'hard',
    points: 200,
    question: 'สถานการณ์วิกฤต: คอมพิวเตอร์ควบคุมห้องกระจายไฟใน Data Center หน้าจอขึ้นสีแดง แจ้งเตือนว่าไฟล์ทั้งหมดกำลังถูกเข้ารหัสด้วย Ransomware! ในฐานะ Cyber Incident Responder สิ่งแรกที่คุณต้องทำทันทีคืออะไร?',
    scenarioContext: {
      type: 'alert',
      header: 'CRITICAL BREACH IN PROGRESS',
      content: 'YOUR FILES ARE BEING ENCRYPTED! Ransomware "MalwareX" active. Network connection detected sending data out.'
    },
    options: [
      'รีบจ่ายเงินไถ่บิตคอยน์ทันทีเพื่อให้มัลแวร์หยุดการทำงาน',
      'ถอดสาย LAN / ปิด Wi-Fi ของเครื่องนั้นทันที (Isolate Network) เพื่อป้องกันไม่ให้มัลแวร์แพร่กระจายไปยังเครื่องอื่นในระบบ',
      'รีสตาร์ตเครื่องคอมพิวเตอร์ซ้ำๆ หลายๆ รอบ',
      'เปิดโปรแกรมตกแต่งรูปภาพเพื่อแคปจอไว้ดูเล่น'
    ],
    correctAnswer: 1,
    explanation: 'ขั้นตอนแรกที่สำคัญที่สุดในการรับมือ Ransomware คือการตัดการเชื่อมต่อเครือข่าย (Isolate Device) ทันที เพื่อยับยั้งการแพร่กระจายไปตามเครือข่ายภายใน',
    hint: 'ระงับการแพร่กระจายไปยังโฮสต์อื่นๆ เป็นลำดับความสำคัญสูงสุด'
  },
  {
    id: 302,
    zone: 3,
    category: 'Zero Trust Network Architecture',
    difficulty: 'hard',
    points: 200,
    question: 'แนวคิดความปลอดภัยไซเบอร์แบบ "Zero Trust Architecture" มีสโลแกนหัวใจสำคัญตรงกับข้อใด?',
    options: [
      'Trust Everyone Inside, Block Everyone Outside (เชื่อใจคนข้างใน เกลียดคนข้างนอก)',
      'Never Trust, Always Verify (ไม่ไว้วางใจใคร ตรวจสอบยืนยันเสมอ)',
      'Once Authenticated, Always Trusted (เข้าสู่ระบบได้แล้ว เชื่อใจตลอดไป)',
      'Security by Obscurity (ความปลอดภัยเกิดจากการซ่อนข้อมูล)'
    ],
    correctAnswer: 1,
    explanation: 'Zero Trust ยึดหลักการว่า ไม่ว่าจะอยู่นอกหรือภายในเครือข่ายองค์กร จะต้องถือว่าเป็นอันตรายทั้งหมด และต้องได้รับการตรวจสอบสิทธิ์และให้สิทธิ์ต่ำสุด (Least Privilege) เสมอ',
    hint: 'หลักการที่ไม่ยอมให้ใครได้สิทธิ์โดยอัตโนมัติแม้จะอยู่ภายในวงแลนเดียวกัน'
  },
  {
    id: 303,
    zone: 3,
    category: 'Supply Chain & Patch Management',
    difficulty: 'hard',
    points: 200,
    question: 'เพราะเหตุใดการอัปเดตระบบปฏิบัติการและซอฟต์แวร์ (Patch Management) อย่างสม่ำเสมอ จึงถือเป็นเกราะป้องกันช่องโหว่ Zero-Day หรือ N-Day ที่สำคัญที่สุด?',
    options: [
      'เพราะการอัปเดตจะช่วยลบไฟล์รูปภาพที่ไม่จำเป็นออก',
      'เพราะการอัปเดตจะช่วยปิดช่องโหว่ความปลอดภัย (Vulnerabilities) ที่นักวิจัยหรือแฮกเกอร์ค้นพบ ก่อนจะถูกนำไปใช้เขียนมัลแวร์โจมตี',
      'เพราะจะทำให้คอมพิวเตอร์เปลี่ยนสีหน้าจอได้',
      'เพราะช่วยเพิ่มความเร็วอินเทอร์เน็ตได้สองเท่า'
    ],
    correctAnswer: 1,
    explanation: 'การอัปเดตซอฟต์แวร์คือการอุดรอยรั่วความปลอดภัย (Security Patches) ซึ่งหากปล่อยทิ้งไว้ แฮกเกอร์จะใช้เครื่องมืออัตโนมัติยิงโจมตีเจาะระบบผ่านช่องโหว่นั้น',
    hint: 'การอัปเดตเปรียบเสมือนการซ่อมแซมกลอนประตูที่ชำรุดของบ้าน'
  },
  {
    id: 304,
    zone: 3,
    category: 'Web Attack Identification',
    difficulty: 'hard',
    points: 200,
    question: 'พิจารณาช่องกรอกข้อมูลค้นหาด้านล่างที่มีการแทรกโค้ดผู้ไม่ประสงค์ดี เหตุการณ์นี้คือการโจมตีรูปแบบใด?',
    scenarioContext: {
      type: 'terminal',
      header: 'INPUT FIELD DETECTED IN LOGIN FORM',
      content: 'Username: admin\' OR \'1\'=\'1\' -- \nPassword: [Anything]'
    },
    options: [
      'Cross-Site Scripting (XSS)',
      'SQL Injection (SQLi)',
      'Buffer Overflow',
      'Denial of Service (DoS)'
    ],
    correctAnswer: 1,
    explanation: 'การใส่ค่า \' OR \'1\'=\'1\' -- คือการทำ SQL Injection หลอกระบบฐานข้อมูลให้ประมวลผลเงื่อนไขที่เป็นจริงเสมอ ทำให้สามารถบายพาสหน้าล็อกอินได้โดยไม่ต้องรู้รหัสผ่านจริง',
    hint: 'สังเกตคำสั่ง OR 1=1 และสัญลักษณ์คอมเมนต์ภาษาคำสั่งฐานข้อมูล'
  },
  {
    id: 305,
    zone: 3,
    category: 'Data Privacy & Ethics',
    difficulty: 'hard',
    points: 200,
    question: 'คุณทำงานเป็นแอดมินระบบและพบช่องโหว่ความปลอดภัยร้ายแรงในเว็บไซต์ของมหาวิทยาลัย ข้อใดคือขั้นตอนการรายงานแบบรับผิดชอบ (Responsible Disclosure) ที่ถูกต้องที่สุด?',
    options: [
      'นำรายละเอียดช่องโหว่และวิธีเจาะไปโพสต์บน Facebook/TikTok ทันทีเพื่ออวดเพื่อน',
      'ขายข้อมูลช่องโหว่นี้ในตลาดมืดเพื่อสร้างรายได้',
      'แจ้งรายละเอียดอย่างเงียบๆ ให้ทีมผู้พัฒนาระบบหรือฝ่ายไอทีของมหาวิทยาลัยทราบ เพื่อทำการแก้ไขก่อนที่จะเปิดเผยต่อสาธารณะ',
      'ใช้ช่องโหว่นั้นแอบเข้าไปแก้ไขเกรดของตัวเองและเพื่อน'
    ],
    correctAnswer: 2,
    explanation: 'Responsible Disclosure คือจริยธรรมของนักรักษาความปลอดภัยไซเบอร์ โดยแจ้งองค์กรผู้ดูแลระบบโดยตรง ให้เวลาทำการแก้ไขอุดช่องโหว่ ก่อนที่จะเปิดเผยรายงานเพื่อป้องกันไม่ให้ผู้ไม่ประสงค์ดีนำไปใช้ทำลายระบบ',
    hint: 'หลักจริยธรรมเน้นการแจ้งเจ้าของระบบเพื่อแก้ไขอย่างปลอดภัยโดยไม่ก่อความเสียหาย'
  }
];

export const BADGE_DEFINITIONS = [
  {
    id: 'novice-shield',
    title: 'Novice Shield',
    tier: 'Novice Shield' as const,
    description: 'ปลดล็อกเมื่อเคลียร์ Zone 1: พิกัดอันตราย ได้สำเร็จ',
    iconName: 'ShieldAlert',
    unlocked: false
  },
  {
    id: 'threat-hunter',
    title: 'Threat Hunter',
    tier: 'Threat Hunter' as const,
    description: 'ปลดล็อกเมื่อทำคะแนนรวมได้ 70% ขึ้นไปในการเอาชีวิตรอด',
    iconName: 'Crosshair',
    unlocked: false
  },
  {
    id: 'cyber-legend',
    title: 'Cyber Legend',
    tier: 'Cyber Legend' as const,
    description: 'ปลดล็อกขั้นสูงสุดเมื่อจบเกมด้วยคะแนน 100% หรือไม่เสีย HP เลยตลอดภารกิจ!',
    iconName: 'Award',
    unlocked: false
  }
];
