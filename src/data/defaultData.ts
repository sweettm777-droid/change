import { CleaningArea, Student } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: '준나', number: 1, gender: 'female' },
  { id: 's2', name: '배민서', number: 2, gender: 'female' },
  { id: 's3', name: '시연', number: 3, gender: 'female' },
  { id: 's4', name: '강도윤', number: 4, gender: 'male' },
  { id: 's5', name: '김민준', number: 5, gender: 'male' },
  { id: 's6', name: '김서준', number: 6, gender: 'male' },
  { id: 's7', name: '김예은', number: 7, gender: 'female' },
  { id: 's8', name: '김지우', number: 8, gender: 'female' },
  { id: 's9', name: '김하은', number: 9, gender: 'female' },
  { id: 's10', name: '박서아', number: 10, gender: 'female' },
  { id: 's11', name: '박시우', number: 11, gender: 'male' },
  { id: 's12', name: '박유준', number: 12, gender: 'male' },
  { id: 's13', name: '신지호', number: 13, gender: 'male' },
  { id: 's14', name: '안다은', number: 14, gender: 'female' },
  { id: 's15', name: '오서진', number: 15, gender: 'male' },
  { id: 's16', name: '유하준', number: 16, gender: 'male' },
  { id: 's17', name: '윤도현', number: 17, gender: 'male' },
  { id: 's18', name: '이수아', number: 18, gender: 'female' },
  { id: 's19', name: '이시은', number: 19, gender: 'female' },
  { id: 's20', name: '이준서', number: 20, gender: 'male' },
  { id: 's21', name: '이하윤', number: 21, gender: 'female' },
  { id: 's22', name: '장예준', number: 22, gender: 'male' },
  { id: 's23', name: '정은우', number: 23, gender: 'male' },
  { id: 's24', name: '조유나', number: 24, gender: 'female' },
];

export const INITIAL_CLEANING_AREAS: CleaningArea[] = [
  {
    id: 'area-sweep',
    category: '교실 쓸기',
    subItems: [
      {
        id: 'sweep-front',
        title: '교실앞',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
      {
        id: 'sweep-mid',
        title: '교실가운데',
        count: 2,
        fixedStudents: [],
        assignedStudents: [],
      },
      {
        id: 'sweep-back',
        title: '교실뒤',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-mop',
    category: '교실 닦기',
    subItems: [
      {
        id: 'mop-front',
        title: '교실앞',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
      {
        id: 'mop-back',
        title: '교실뒤',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-board',
    category: '칠판 정리\n(역할 연동)',
    subItems: [
      {
        id: 'board-clean',
        title: '칠판 닦고, 걸레 빨기',
        count: 2, // 준나 (음영 고정) + 1명
        fixedStudents: ['준나'],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-cloth',
    category: '손걸레\n(월수금)',
    subItems: [
      {
        id: 'cloth-clean',
        title: '사물함, 난방기, 창틀, 복도 창틀 위\n손걸레로 깨끗이 닦고, 걸레 빨기',
        count: 2,
        fixedStudents: ['배민서', '시연'],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-corridor',
    category: '복도',
    subItems: [
      {
        id: 'corridor-sweep',
        title: '쓸기',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
      {
        id: 'corridor-mop',
        title: '닦기(필요시 분리수거 지원)',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-recycle',
    category: '분리수거',
    subItems: [
      {
        id: 'recycle-main',
        title: '종이, 일반쓰레기 분리수거, 꾹꾹 눌러주기, 주변 정리 청소도구함 정리',
        count: 1,
        fixedStudents: [],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-special',
    category: '특별구역',
    subItems: [
      {
        id: 'special-stairs',
        title: '2층 서쪽(경비실) 계단 및 음수대,\n2층 서편 홈베이스(자판기)',
        count: 4,
        fixedStudents: [],
        assignedStudents: [],
      },
    ],
  },
  {
    id: 'area-special-tue-thu',
    category: '특별구역\n(화목)',
    subItems: [
      {
        id: 'special-recycle-station',
        title: '분리수거장',
        count: 2,
        fixedStudents: ['배민서', '시연'],
        assignedStudents: [],
      },
    ],
  },
];
