/**
 * Default content for THAI WSK 2026 Academic Event Website
 */

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  badge?: string;
  sortOrder: number;
}

export interface AwardCriterion {
  id: string;
  title: string;
  rangeText: string;
  percentageText: string;
  description: string;
  colorGrade: 'gold' | 'silver' | 'bronze' | 'honor';
  sortOrder: number;
  isActive: boolean;
}

export interface ScheduleItem {
  id: string;
  topic: string;
  date: string;
  time: string;
  location: string;
  description: string;
  sortOrder: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  imageUrl?: string;
  isPinned: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ExamLevel {
  id: 'junior' | 'senior';
  levelTitle: string;
  grades: string;
  description: string;
  formUrl: string;
  timeLimitMinutes: number;
  questionCount: number;
  isOpen: boolean;
  instructions: string[];
}

export interface StudyMaterial {
  id: string;
  level: 'junior' | 'senior'; // ม.ต้น (ม.1–ม.3) | ม.ปลาย (ม.4–ม.6)
  type: 'pdf' | 'youtube'; // เอกสาร PDF | วิดีโอ YouTube
  title: string;
  description: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteImages {
  headerLogoUrl: string; // โลโก้หัวเว็บ / แถบเมนู
  faviconUrl: string;   // ไอคอนเว็บ
  heroLogoUrl: string;  // โลโก้หลักส่วนหัวเว็บไซต์ (Hero Section - ภาพนิ่ง)
  heroBackgroundUrl: string; // ภาพพื้นหลัง Hero Section (ตัวเลือกเสริม)
  aboutMainImageUrl: string;  // รูปหลักเกี่ยวกับโครงการ
  aboutSecondaryImageUrl: string; // รูปประกอบรองเกี่ยวกับโครงการ
  aboutTeacherTeamUrl: string; // รูปรวมคณะครูภาษาไทย
  examBannerUrl: string;     // แบนเนอร์หน้าระบบทำแบบทดสอบ
  scoreBannerUrl: string;    // แบนเนอร์หน้าตรวจสอบคะแนน
  certificateBannerUrl: string; // แบนเนอร์หน้าเกียรติบัตร
  footerLogoUrl: string;     // ตราโรงเรียนท้ายเว็บ
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  siteMeta: {
    title: string;
    subtitle: string;
    academicYear: string;
    countdownTarget: string; // ISO date string
    countdownLabel: string;
  };
  siteImages: SiteImages;
  heroSlides: HeroSlide[];
  studyMaterials: StudyMaterial[];
  about: {
    title: string;
    leadText: string;
    bodyParagraphs: string[];
    objectives: string[];
    imageUrl: string;
    secondaryImageUrl: string;
    teacherImageUrl?: string;
  };
  awardCriteria: AwardCriterion[];
  schedule: ScheduleItem[];
  announcements: AnnouncementItem[];
  exams: ExamLevel[];
  instructions: {
    examGeneral: string[];
    scoreCheck: string[];
    certificate: string[];
  };
  footer: {
    department: string;
    school: string;
    address: string;
    telephone: string;
    fax: string;
    email: string;
    websiteUrl: string;
    developerName: string;
    developerRole: string;
    developerContact: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  version: 1,
  updatedAt: '2026-11-08T00:00:00.000Z',
  siteMeta: {
    title: 'THAI WSK 2026',
    subtitle: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
    academicYear: 'ปีการศึกษา ๒๕๖๙',
    countdownTarget: '2026-12-15T09:00:00+07:00',
    countdownLabel: 'เปิดระบบสอบวัดความรู้ภาษาไทยออนไลน์',
  },
  siteImages: {
    headerLogoUrl: 'images/school_wsk_emblem_1794141246706.jpg',
    faviconUrl: 'favicon.svg',
    heroLogoUrl: '',
    heroBackgroundUrl: 'images/hero_thai_wsk_banner_1794141245856.jpg',
    aboutMainImageUrl: 'images/about_academic_thai_1794141247386.jpg',
    aboutSecondaryImageUrl: 'images/thai_literature_contest_1794141246113.jpg',
    aboutTeacherTeamUrl: 'images/thai_teacher_team_2026.png',
    examBannerUrl: 'images/about_academic_thai_1794141247386.jpg',
    scoreBannerUrl: 'images/hero_thai_wsk_banner_1794141245856.jpg',
    certificateBannerUrl: 'images/thai_literature_contest_1794141246113.jpg',
    footerLogoUrl: 'images/school_wsk_emblem_1794141246706.jpg',
  },
  studyMaterials: [],
  heroSlides: [
    {
      id: 'slide-1',
      imageUrl: 'images/hero_thai_wsk_banner_1794141245856.jpg',
      title: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
      subtitle: 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย ประจำปีการศึกษา ๒๕๖๙',
      badge: 'กิจกรรมวิชาการระดับโรงเรียน',
      sortOrder: 1,
    },
    {
      id: 'slide-2',
      imageUrl: 'images/about_academic_thai_1794141247386.jpg',
      title: 'เวทีประลองปัญญา เชิดชูคุณค่าภาษาไทย',
      subtitle: 'ส่งเสริมทักษะการอ่าน วรรณกรรม วรรณคดี และหลักภาษาไทยสู่ความเป็นเลิศ',
      badge: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
      sortOrder: 2,
    },
    {
      id: 'slide-3',
      imageUrl: 'images/thai_literature_contest_1794141246113.jpg',
      title: 'มรดกอักษรศาสตร์ น้อมรำลึกมหากวีสุนทรภู่',
      subtitle: 'ร่วมสืบสานความไพเราะทางภาษา และวรรณศิลป์อันเป็นสมบัติล้ำค่าของชาติ',
      badge: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
      sortOrder: 3,
    },
  ],
  about: {
    title: 'เกี่ยวกับโครงการวิชาการ',
    leadText: 'การขับเคลื่อนพลังปัญญาผ่านภาษาและวรรณศิลป์ไทย เพื่อยกระดับสมรรถนะผู้เรียนในศตวรรษที่ ๒๑',
    bodyParagraphs: [
      'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ" มุ่งมั่นส่งเสริมให้นักเรียนตระหนักถึงคุณค่าและความงดงามของภาษาไทย อันเป็นเอกลักษณ์ประจำชาติและเป็นเครื่องมือสำคัญในการแสวงหาความรู้',
      'กิจกรรม "สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย" จัดขึ้นเพื่อประเมินและพัฒนาองค์ความรู้ทางด้านภาษาไทย ทั้งหลักภาษา การใช้ภาษา วรรณคดี วรรณกรรม และการอ่านจับใจความอย่างลึกซึ้ง ผ่านระบบออนไลน์ที่ทันสมัย เที่ยงตรง และเปิดกว้างสำหรับผู้เรียนทุกคน',
    ],
    objectives: [
      'เพื่อส่งเสริมให้นักเรียนมีความรู้ความเข้าใจในหลักภาษาและการใช้ภาษาไทยที่ถูกต้อง',
      'เพื่อเปิดโอกาสให้นักเรียนได้ทดสอบวัดสมรรถนะทางภาษาไทยตามมาตรฐานหลักสูตรแกนกลาง',
      'เพื่อเชิดชูเกียรติและสร้างแรงบันดาลใจในการศึกษาภาษาและวรรณคดีไทยผ่านเกียรติบัตรอิเล็กทรอนิกส์',
      'เพื่อนำผลการประเมินไปใช้เป็นข้อมูลสารสนเทศในการพัฒนาการจัดการเรียนการสอนอย่างมีประสิทธิภาพ',
    ],
    imageUrl: 'images/about_academic_thai_1794141247386.jpg',
    secondaryImageUrl: 'images/thai_literature_contest_1794141246113.jpg',
    teacherImageUrl: 'images/thai_teacher_team_2026.png',
  },
  awardCriteria: [
    {
      id: 'crit-1',
      title: 'เหรียญทอง',
      rangeText: 'คะแนน ๑๘ – ๒๐ คะแนน',
      percentageText: 'ร้อยละ ๙๐ ขึ้นไป',
      description: 'ระดับผลการประเมินดีเยี่ยม มีความรู้ความสามารถภาษาไทยในระดับสูงมาก',
      colorGrade: 'gold',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'crit-2',
      title: 'เหรียญเงิน',
      rangeText: 'คะแนน ๑๕ – ๑๗ คะแนน',
      percentageText: 'ร้อยละ ๗๕ – ๘๙',
      description: 'ระดับผลการประเมินดีเด่น มีทักษะและความรอบรู้ภาษาไทยในระดับดี',
      colorGrade: 'silver',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'crit-3',
      title: 'เหรียญทองแดง',
      rangeText: 'คะแนน ๑๒ – ๑๔ คะแนน',
      percentageText: 'ร้อยละ ๖๐ – ๗๔',
      description: 'ระดับผลการประเมินผ่านเกณฑ์มาตรฐานภาษาไทยตามเกณฑ์ที่กำหนด',
      colorGrade: 'bronze',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'crit-4',
      title: 'รางวัลชมเชย',
      rangeText: 'คะแนน ๑๐ – ๑๑ คะแนน',
      percentageText: 'ร้อยละ ๕๐ – ๕๙',
      description: 'ระดับผลการประเมินขั้นพื้นฐาน และได้รับเกียรติบัตรเข้าร่วมกิจกรรม',
      colorGrade: 'honor',
      sortOrder: 4,
      isActive: true,
    },
  ],
  schedule: [
    {
      id: 'sched-1',
      topic: 'ประชาสัมพันธ์โครงการและเตรียมความพร้อมนักเรียน',
      date: '๑ – ๑๐ ธันวาคม ๒๕๖๙',
      time: '๐๘.๓๐ – ๑๖.๓๐ น.',
      location: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ" และช่องทางออนไลน์',
      description: 'ชี้แจงระเบียบ กติกา และเนื้อหาขอบข่ายการทดสอบความรู้ภาษาไทย',
      sortOrder: 1,
      status: 'completed',
    },
    {
      id: 'sched-2',
      topic: 'เปิดระบบทำแบบทดสอบออนไลน์ (ม.ต้น และ ม.ปลาย)',
      date: '๑๕ – ๒๐ ธันวาคม ๒๕๖๙',
      time: 'เปิดระบบ ๒๔ ชั่วโมง',
      location: 'ระบบออนไลน์ THAI WSK 2026 ผ่าน Google Forms',
      description: 'นักเรียนเข้าทำแบบทดสอบวัดความรู้ตามระดับชั้น ม.๑–๓ และ ม.๔–๖',
      sortOrder: 2,
      status: 'ongoing',
    },
    {
      id: 'sched-3',
      topic: 'ประมวลผลคะแนนและปิดรับคำตอบ',
      date: '๒๑ ธันวาคม ๒๕๖๙',
      time: '๒๓.๕๙ น.',
      location: 'ศูนย์ข้อมูลกลุ่มสาระการเรียนรู้ภาษาไทย',
      description: 'คณะกรรมการรวบรวมและตรวจสอบความถูกต้องของคะแนนสอบ',
      sortOrder: 3,
      status: 'upcoming',
    },
    {
      id: 'sched-4',
      topic: 'เปิดระบบตรวจสอบคะแนนและดาวน์โหลดเกียรติบัตร',
      date: '๒๕ ธันวาคม ๒๕๖๙ เป็นต้นไป',
      time: '๐๙.๐๐ น.',
      location: 'เว็บไซต์ THAI WSK 2026',
      description: 'นักเรียนสามารถค้นหาคะแนนและพิมพ์เกียรติบัตรอิเล็กทรอนิกส์ได้ทันที',
      sortOrder: 4,
      status: 'upcoming',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'แนวปฏิบัติในการเข้าทำแบบทดสอบความรู้ภาษาไทยออนไลน์ ประจำปี ๒๕๖๙',
      date: '๑๔ ธันวาคม ๒๕๖๙',
      author: 'คณะกรรมการดำเนินงานกลุ่มสาระฯ ภาษาไทย',
      content: 'ขอให้นักเรียนทุกคนอ่านคำชี้แจงก่อนเริ่มทำแบบทดสอบ ตรวจสอบชื่อ-นามสกุล ระดับชั้น และห้องให้ถูกต้อง โดยสามารถทำแบบทดสอบได้ครั้งเดียวเท่านั้น',
      isPinned: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ann-2',
      title: 'กำหนดการเปิดระบบตรวจสอบคะแนนและการดาวน์โหลดเกียรติบัตร',
      date: '๒๐ ธันวาคม ๒๕๖๙',
      author: 'ฝ่ายวัดและประเมินผล',
      content: 'ระบบตรวจสอบคะแนนจะเปิดให้เข้าตรวจค้นตามรายชื่อจริงที่ส่งเข้าในระบบ โดยเกียรติบัตรอิเล็กทรอนิกส์จะสามารถดาวน์โหลดเป็นไฟล์ PDF คุณภาพสูงได้โดยตรง',
      isPinned: false,
      isActive: true,
      sortOrder: 2,
    },
  ],
  exams: [
    {
      id: 'junior',
      levelTitle: 'ระดับมัธยมศึกษาตอนต้น',
      grades: 'ชั้นมัธยมศึกษาปีที่ ๑ – ๓',
      description: 'ข้อสอบวัดความรู้หลักภาษา วรรณคดีวิจักษ์ วรรณคดีลำนำ และทักษะการอ่านจับใจความระดับมัธยมศึกษาตอนต้น',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-JUNIOR/viewform',
      timeLimitMinutes: 45,
      questionCount: 20,
      isOpen: true,
      instructions: [
        'นักเรียนต้องกรอกข้อมูลส่วนบุคคล ชื่อ-นามสกุล ชั้น และห้องเรียน ให้ตรงกับข้อมูลในระบบทะเบียนโรงเรียน',
        'ข้อสอบมีทั้งหมด ๒๐ ข้อ คะแนนเต็ม ๒๐ คะแนน ให้เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว',
        'ระบบอนุญาตให้ส่งคำตอบได้เพียง ๑ ครั้งต่อหนึ่งบัญชีผู้เข้าสอบ',
        'เมื่อกดปุ่ม "ส่งคำตอบ" (Submit) แล้วจะไม่สามารถย้อนกลับมาแก้ไขได้',
      ],
    },
    {
      id: 'senior',
      levelTitle: 'ระดับมัธยมศึกษาตอนปลาย',
      grades: 'ชั้นมัธยมศึกษาปีที่ ๔ – ๖',
      description: 'ข้อสอบวัดความรู้หลักภาษาไทยขั้นสูง วรรณคดีและวรรณกรรม ทัศนะเชิงวรรณศิลป์ และการวิเคราะห์ภาษาเชิงลึก',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-SENIOR/viewform',
      timeLimitMinutes: 45,
      questionCount: 20,
      isOpen: true,
      instructions: [
        'นักเรียนกรอกชื่อ-นามสกุล ระดับชั้น และห้องเรียน ให้ครบถ้วนและถูกต้อง',
        'ข้อสอบครอบคลุมเนื้อหาหลักภาษาและการใช้ภาษา วรรณคดีมรดก และบทประพันธ์สำคัญ',
        'จำนวนข้อสอบ ๒๐ ข้อ คะแนนเต็ม ๒๐ คะแนน อนุญาตให้ส่งคำตอบได้ ๑ ครั้ง',
        'กรุณาตรวจสอบความถูกต้องของคำตอบทั้งหมดก่อนยืนยันการส่งข้อสอบ',
      ],
    },
  ],
  instructions: {
    examGeneral: [
      'ศึกษาคำแนะนำและขอบข่ายเนื้อหาข้อสอบก่อนคลิกเข้าสู่ลิงก์ Google Forms',
      'เตรียมสัญญาณอินเทอร์เน็ตให้พร้อมก่อนเริ่มทำแบบทดสอบ',
      'หากพบปัญหาในการเข้าทำแบบทดสอบ สามารถติดต่อคุณครูกลุ่มสาระฯ ภาษาไทยได้ทันที',
    ],
    scoreCheck: [
      'กรอกชื่อ หรือ ชื่อ-นามสกุล ของนักเรียนในช่องค้นหา',
      'รองรับการค้นหาทั้งแบบมีและไม่มีคำนำหน้า (เช่น ด.ช., ด.ญ., นาย, นางสาว)',
      'ระบบจะแสดงผลคะแนนและสถานะผลการประเมินโดยตรงจากฐานข้อมูลโรงเรียน',
    ],
    certificate: [
      'กรอกชื่อหรือชื่อ-นามสกุลเพื่อค้นหาเกียรติบัตรของตนเอง',
      'สามารถคลิกปุ่ม "เปิดดูเกียรติบัตร" หรือ "ดาวน์โหลดเกียรติบัตร" เพื่อรับไฟล์ PDF',
      'หากไม่สามารถเปิดหรือดาวน์โหลดไฟล์ได้ กรุณาติดต่อครูผู้รับผิดชอบระบบ',
    ],
  },
  footer: {
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
    school: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    address: '๔๔๒/๓๐ ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร ๗๔๑๑๐',
    telephone: '034-471902',
    fax: '034-471901',
    email: 'wisetschool@gmail.com',
    websiteUrl: 'https://www.wsk.ac.th/wp/',
    developerName: 'นายณัฐวุฒิ ธนาศิริธนวัชร์',
    developerRole: 'นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ ๒ สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร',
    developerContact: 'FB: Nattawut BK',
  },
};
