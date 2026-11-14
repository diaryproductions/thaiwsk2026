/**
 * Default content for สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย Academic Event Website
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

export type ImageSectionPlacement =
  | 'heroLogo'
  | 'headerLogo'
  | 'about'
  | 'activity'
  | 'announcement'
  | 'other';

export interface ManagedSiteImage {
  id: string;
  title: string;
  url: string;
  section: ImageSectionPlacement;
  alignment: 'left' | 'center' | 'right';
  width: string;
  height: string;
  objectFit: 'contain' | 'cover';
  spacing: number;
  sortOrder: number;
  isVisible: boolean;
  caption?: string;
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

export const DEFAULT_SITE_IMAGE_ITEMS: ManagedSiteImage[] = [
  {
    id: 'img-hero-logo',
    title: 'โลโก้โครงการหลักส่วนหัวเว็บไซต์ (Hero Logo)',
    url: 'images/ครูไทยวิเศษฯ-2026 (1).png',
    section: 'heroLogo',
    alignment: 'center',
    width: '360px',
    height: '180px',
    objectFit: 'contain',
    spacing: 16,
    sortOrder: 1,
    isVisible: true,
    caption: 'โลโก้หลักประจำโครงการ สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  },
  {
    id: 'img-header-logo',
    title: 'ตราสัญลักษณ์แถบเมนูด้านบน (Header Logo)',
    url: 'images/school_wsk_emblem_1794141246706.jpg',
    section: 'headerLogo',
    alignment: 'left',
    width: '44px',
    height: '44px',
    objectFit: 'cover',
    spacing: 8,
    sortOrder: 2,
    isVisible: true,
    caption: 'ตรากลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
  },
  {
    id: 'img-about-main',
    title: 'ภาพบรรยากาศกิจกรรมวิชาการ (เกี่ยวกับโครงการ)',
    url: 'images/about_academic_thai_1794141247386.jpg',
    section: 'about',
    alignment: 'center',
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    spacing: 16,
    sortOrder: 3,
    isVisible: true,
    caption: 'บรรยากาศการวัดและประเมินผลความรู้ภาษาไทย',
  },
  {
    id: 'img-about-teacher',
    title: 'ภาพคณะครูกลุ่มสาระการเรียนรู้ภาษาไทย',
    url: 'images/thai_teacher_team_2026.png',
    section: 'about',
    alignment: 'center',
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    spacing: 12,
    sortOrder: 4,
    isVisible: true,
    caption: 'คณะครูผู้สอนภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
  },
];

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
  siteImageItems?: ManagedSiteImage[];
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
    title: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
    subtitle: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
    academicYear: 'ปีการศึกษา 2569',
    countdownTarget: '2026-12-15T09:00:00+07:00',
    countdownLabel: 'เปิดระบบสอบวัดความรู้ภาษาไทยออนไลน์',
  },
  siteImages: {
    headerLogoUrl: 'https://img1.pic.in.th/images/logo-thaiwsk.png',
    faviconUrl: 'https://img1.pic.in.th/images/logo-thaiwsk.png',
    heroLogoUrl: 'images/ครูไทยวิเศษฯ-2026 (1).png',
    heroBackgroundUrl: '',
    aboutMainImageUrl: '',
    aboutSecondaryImageUrl: '',
    aboutTeacherTeamUrl: '',
    examBannerUrl: '',
    scoreBannerUrl: '',
    certificateBannerUrl: '',
    footerLogoUrl: 'https://img1.pic.in.th/images/logo-thaiwsk.png',
  },
  siteImageItems: [],
  studyMaterials: [],
  heroSlides: [],
  about: {
    title: 'เกี่ยวกับโครงการวิชาการ',
    leadText: 'การขับเคลื่อนพลังปัญญาผ่านภาษาและวรรณศิลป์ไทย เพื่อยกระดับสมรรถนะผู้เรียนในศตวรรษที่ 21',
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
    imageUrl: '',
    secondaryImageUrl: '',
    teacherImageUrl: '',
  },
  awardCriteria: [
    {
      id: 'crit-1',
      title: 'เหรียญทอง',
      rangeText: 'คะแนน 18 – 20 คะแนน',
      percentageText: 'ร้อยละ 90 ขึ้นไป',
      description: 'ระดับผลการประเมินดีเยี่ยม มีความรู้ความสามารถภาษาไทยในระดับสูงมาก',
      colorGrade: 'gold',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'crit-2',
      title: 'เหรียญเงิน',
      rangeText: 'คะแนน 15 – 17 คะแนน',
      percentageText: 'ร้อยละ 75 – 89',
      description: 'ระดับผลการประเมินดีเด่น มีทักษะและความรอบรู้ภาษาไทยในระดับดี',
      colorGrade: 'silver',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'crit-3',
      title: 'เหรียญทองแดง',
      rangeText: 'คะแนน 12 – 14 คะแนน',
      percentageText: 'ร้อยละ 60 – 74',
      description: 'ระดับผลการประเมินผ่านเกณฑ์มาตรฐานภาษาไทยตามเกณฑ์ที่กำหนด',
      colorGrade: 'bronze',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'crit-4',
      title: 'รางวัลชมเชย',
      rangeText: 'คะแนน 10 – 11 คะแนน',
      percentageText: 'ร้อยละ 50 – 59',
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
      date: '1 – 10 ธันวาคม 2569',
      time: '08.30 – 16.30 น.',
      location: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ" และช่องทางออนไลน์',
      description: 'ชี้แจงระเบียบ กติกา และเนื้อหาขอบข่ายการทดสอบความรู้ภาษาไทย',
      sortOrder: 1,
      status: 'completed',
    },
    {
      id: 'sched-2',
      topic: 'เปิดระบบทำแบบทดสอบออนไลน์ (ม.ต้น และ ม.ปลาย)',
      date: '15 – 20 ธันวาคม 2569',
      time: 'เปิดระบบ 24 ชั่วโมง',
      location: 'ระบบออนไลน์ สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย ผ่าน Google Forms',
      description: 'นักเรียนเข้าทำแบบทดสอบวัดความรู้ตามระดับชั้น ม.1–3 และ ม.4–6',
      sortOrder: 2,
      status: 'ongoing',
    },
    {
      id: 'sched-3',
      topic: 'ประมวลผลคะแนนและปิดรับคำตอบ',
      date: '21 ธันวาคม 2569',
      time: '23.59 น.',
      location: 'ศูนย์ข้อมูลกลุ่มสาระการเรียนรู้ภาษาไทย',
      description: 'คณะกรรมการรวบรวมและตรวจสอบความถูกต้องของคะแนนสอบ',
      sortOrder: 3,
      status: 'upcoming',
    },
    {
      id: 'sched-4',
      topic: 'เปิดระบบตรวจสอบคะแนนและดาวน์โหลดเกียรติบัตร',
      date: '25 ธันวาคม 2569 เป็นต้นไป',
      time: '09.00 น.',
      location: 'เว็บไซต์ สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
      description: 'นักเรียนสามารถค้นหาคะแนนและพิมพ์เกียรติบัตรอิเล็กทรอนิกส์ได้ทันที',
      sortOrder: 4,
      status: 'upcoming',
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'แนวปฏิบัติในการเข้าทำแบบทดสอบความรู้ภาษาไทยออนไลน์ ประจำปี 2569',
      date: '14 ธันวาคม 2569',
      author: 'คณะกรรมการดำเนินงานกลุ่มสาระฯ ภาษาไทย',
      content: 'ขอให้นักเรียนทุกคนอ่านคำชี้แจงก่อนเริ่มทำแบบทดสอบ ตรวจสอบชื่อ-นามสกุล ระดับชั้น และห้องให้ถูกต้อง โดยสามารถเข้าทำแบบทดสอบได้ไม่จำกัดจำนวนครั้ง',
      isPinned: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ann-2',
      title: 'กำหนดการเปิดระบบตรวจสอบคะแนนและการดาวน์โหลดเกียรติบัตร',
      date: '20 ธันวาคม 2569',
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
      grades: 'ชั้นมัธยมศึกษาปีที่ 1 – 3',
      description: 'ข้อสอบวัดความรู้หลักภาษา วรรณคดีวิจักษ์ วรรณคดีลำนำ และทักษะการอ่านจับใจความระดับมัธยมศึกษาตอนต้น',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-JUNIOR/viewform',
      timeLimitMinutes: 0,
      questionCount: 20,
      isOpen: true,
      instructions: [
        'นักเรียนต้องกรอกข้อมูลส่วนบุคคล ชื่อ-นามสกุล ชั้น และห้องเรียน ให้ตรงกับข้อมูลในระบบทะเบียนโรงเรียน',
        'ข้อสอบมีทั้งหมด 20 ข้อ คะแนนเต็ม 20 คะแนน ให้เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว',
        'สามารถเข้าทำและส่งคำตอบได้ไม่จำกัดจำนวนครั้ง',
        'กรุณาตรวจสอบความถูกต้องของชื่อ-นามสกุล ระดับชั้น และห้องเรียนก่อนกดส่งคำตอบ',
      ],
    },
    {
      id: 'senior',
      levelTitle: 'ระดับมัธยมศึกษาตอนปลาย',
      grades: 'ชั้นมัธยมศึกษาปีที่ 4 – 6',
      description: 'ข้อสอบวัดความรู้หลักภาษาไทยขั้นสูง วรรณคดีและวรรณกรรม ทัศนะเชิงวรรณศิลป์ และการวิเคราะห์ภาษาเชิงลึก',
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-SENIOR/viewform',
      timeLimitMinutes: 0,
      questionCount: 20,
      isOpen: true,
      instructions: [
        'นักเรียนกรอกชื่อ-นามสกุล ระดับชั้น และห้องเรียน ให้ครบถ้วนและถูกต้อง',
        'ข้อสอบครอบคลุมเนื้อหาหลักภาษาและการใช้ภาษา วรรณคดีมรดก และบทประพันธ์สำคัญ',
        'จำนวนข้อสอบ 20 ข้อ คะแนนเต็ม 20 คะแนน สามารถเข้าทำและส่งคำตอบได้ไม่จำกัดจำนวนครั้ง',
        'กรุณาตรวจสอบความถูกต้องของคำตอบทั้งหมดก่อนยืนยันการส่งข้อสอบ',
      ],
    },
  ],
  instructions: {
    examGeneral: [
      'ศึกษาคำแนะนำและขอบข่ายเนื้อหาข้อสอบก่อนคลิกเข้าสู่ลิงก์ Google Forms',
      'เตรียมสัญญาณอินเทอร์เน็ตให้พร้อมก่อนเริ่มทำแบบทดสอบ',
      'หากพบปัญหาคะแนนไม่ถูกต้องหรือสะกดชื่อผิดพลาด ให้ติดต่อ ครูแบงค์ ณัฐวุฒิ ธนาศิริธนวัชร์ ที่ห้องกลุ่มบริหารทั่วไป อาคาร 2 หรือติดต่อทาง Facebook: Nattawut BK',
    ],
    scoreCheck: [
      'กรอกชื่อ หรือ ชื่อ-นามสกุล ของนักเรียนในช่องค้นหา',
      'รองรับการค้นหาทั้งแบบมีและไม่มีคำนำหน้า (เช่น ด.ช., ด.ญ., นาย, นางสาว)',
      'ระบบจะแสดงผลคะแนนและสถานะผลการประเมินโดยตรงจากฐานข้อมูลโรงเรียน',
      'หากพบปัญหาคะแนนไม่ถูกต้องหรือสะกดชื่อผิดพลาด ให้ติดต่อ ครูแบงค์ ณัฐวุฒิ ธนาศิริธนวัชร์ ที่ห้องกลุ่มบริหารทั่วไป อาคาร 2 หรือติดต่อทาง Facebook: Nattawut BK',
    ],
    certificate: [
      'กรอกชื่อหรือชื่อ-นามสกุลเพื่อค้นหาเกียรติบัตรของตนเอง',
      'สามารถคลิกปุ่ม "เปิดดูเกียรติบัตร" หรือ "ดาวน์โหลดเกียรติบัตร" เพื่อรับไฟล์ PDF',
      'หากพบปัญหาคะแนนไม่ถูกต้องหรือสะกดชื่อผิดพลาด ให้ติดต่อ ครูแบงค์ ณัฐวุฒิ ธนาศิริธนวัชร์ ที่ห้องกลุ่มบริหารทั่วไป อาคาร 2 หรือติดต่อทาง Facebook: Nattawut BK',
    ],
  },
  footer: {
    department: 'กลุ่มสาระการเรียนรู้ภาษาไทย',
    school: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    address: '442/30 ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร 74110',
    telephone: '034-471902',
    fax: '034-471901',
    email: 'wisetschool@gmail.com',
    websiteUrl: 'https://www.wsk.ac.th/wp/',
    developerName: 'นายณัฐวุฒิ ธนาศิริธนวัชร์',
    developerRole: 'นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ 2 สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร',
    developerContact: 'FB: Nattawut BK',
  },
};
