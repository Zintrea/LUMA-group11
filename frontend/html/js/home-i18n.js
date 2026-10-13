// ==========================================
// 🌐 LUMA HOME — สลับภาษา TH / EN
// + slider เทียบ before/after + reveal ตอนเลื่อน
// ใช้เฉพาะหน้าแรก (home.html)
// ==========================================

(() => {

  const STORAGE_KEY = 'luma_lang';

  // ========================================
  // คำแปล (ข้อความภาษาอังกฤษตัวหลักอยู่ใน home.html ด้วย)
  // ========================================

  const DICT = {
    en: {
      'page.title': 'LUMA Group11 - AI Image Studio',

      'nav.features': 'Features',
      'nav.how': 'How it works',
      'nav.team': 'Team',
      'nav.signin': 'Sign In',
      'nav.start': 'Get Started',
      'nav.workspace': 'Workspace',

      'hero.tagline': 'Type it. Generate it. Fix it.',
      'hero.lead': 'An AI image studio built by four students for our Image Processing course. Turn a sentence into a picture, then clean it up with the image processing we coded ourselves.',
      'hero.cta': 'Start creating',
      'hero.workspace': 'Go to Workspace',
      'hero.how': 'See how it works',
      'hero.tryme': 'try it here!',
      'hero.prompt': 'a cat astronaut, watercolor',
      'hero.canvas': 'your picture shows up here',
      'hero.sticky': '4 people · 4 PCs · 1 web app :)',

      'feat.title': 'What can it do?',
      'feat.sub': 'The pictures below are real outputs from our own code, not mock-ups.',
      'feat.gen.title': 'Text to Image',
      'feat.gen.text': 'Write a prompt, pick the Realistic or Anime model, and Stable Diffusion Forge on PC2 paints it for you.',
      'feat.gen.prompt': 'a cozy bookshop at night, anime style',
      'feat.gen.proof': 'sent to Forge: /sdapi/v1/txt2img',
      'feat.bg.title': 'Background Removal',
      'feat.bg.text': 'Upload a photo and rembg cuts out the subject. You get a transparent PNG.',
      'feat.bg.png': 'transparent PNG',
      'feat.hm.title': 'Histogram Matching',
      'feat.hm.text': 'Borrow the colors of one photo and pour them into another. We match the histogram of each RGB channel through its CDF.',
      'feat.hm.source': 'source',
      'feat.hm.ref': 'reference',
      'feat.hm.result': 'result!',
      'feat.hm.proof': 'real output from <code>hismat.py</code>',
      'feat.blur.title': 'Gaussian Blur',
      'feat.blur.text': 'Soften a photo with low, medium or high strength. Drag the line to compare.',
      'feat.blur.proof': 'real output from <code>blur.py</code>, strength: high',
      'feat.gray.title': 'Grayscale & Contrast',
      'feat.gray.text': 'Turn a photo gray, then stretch its contrast with histogram equalization.',
      'feat.gray.proof': 'real output from <code>contrast.py</code>',
      'cmp.before': 'before',
      'cmp.after': 'after',
      'cmp.aria': 'Compare before and after',

      'how.title': 'How it works',
      'how.sub': 'Four computers on one network, each with its own job.',
      'how.browser': 'Browser',
      'how.browser.1': 'The user opens LUMA',
      'how.pc1.1': 'Serves the web pages',
      'how.pc1.2': 'Reverse proxy for /api/*',
      'how.pc3.1': 'APIs and login',
      'how.pc3.2': 'Blur, histogram matching, contrast',
      'how.pc3.3': 'Talks to the AI and the database',
      'how.pc2.1': 'Text to image',
      'how.pc2.2': 'Background removal (rembg)',
      'how.pc4.1': 'Users',
      'how.pc4.2': 'Image job logs',
      'how.note.browser': 'you open the web app here!',
      'how.note.backend': 'handles requests, jobs and logins',
      'how.note.nginx': 'routes every request',
      'how.note.data': 'AI paints, database remembers',

      'team.title': 'Our Team',
      'team.db': 'Database',
      'team.fe': 'Frontend',
      'team.be': 'Backend',
      'team.ops': 'DevOps + AI',

      'cta.title': 'Ready to make something?',
      'cta.text': 'Sign in and your first picture is one sentence away.',
      'cta.open': 'Open the workspace',

      'footer.made': 'LUMA Group11 · Image Processing term project',
      'footer.photos': 'Sample photos:'
    },

    th: {
      'page.title': 'LUMA Group11 - สตูดิโอสร้างภาพด้วย AI',

      'nav.features': 'ฟีเจอร์',
      'nav.how': 'ทำงานยังไง',
      'nav.team': 'ทีม',
      'nav.signin': 'เข้าสู่ระบบ',
      'nav.start': 'เริ่มใช้งาน',
      'nav.workspace': 'เข้า Workspace',

      'hero.tagline': 'พิมพ์ · สร้าง · แต่งต่อ จบในที่เดียว',
      'hero.lead': 'สตูดิโอสร้างภาพด้วย AI ที่พวกเราสี่คนทำขึ้นในวิชา Image Processing พิมพ์ประโยคเดียวให้ AI วาดภาพ แล้วแต่งต่อด้วยเครื่องมือประมวลผลภาพที่พวกเราเขียนโค้ดเอง',
      'hero.cta': 'เริ่มสร้างภาพ',
      'hero.workspace': 'ไปที่ Workspace',
      'hero.how': 'ดูว่าทำงานยังไง',
      'hero.tryme': 'ลองตรงนี้เลย!',
      'hero.prompt': 'แมวนักบินอวกาศ สีน้ำ',
      'hero.canvas': 'ภาพของคุณจะโผล่ตรงนี้',
      'hero.sticky': '4 คน · 4 เครื่อง · 1 เว็บแอป :)',

      'feat.title': 'ทำอะไรได้บ้าง?',
      'feat.sub': 'ภาพด้านล่างคือผลลัพธ์จริงจากโค้ดของพวกเรา ไม่ใช่ภาพจำลอง',
      'feat.gen.title': 'สร้างภาพจากข้อความ',
      'feat.gen.text': 'พิมพ์ prompt เลือกโมเดล Realistic หรือ Anime แล้ว Stable Diffusion Forge บน PC2 จะวาดให้',
      'feat.gen.prompt': 'ร้านหนังสืออบอุ่นยามค่ำคืน สไตล์อนิเมะ',
      'feat.gen.proof': 'ส่งไปที่ Forge: /sdapi/v1/txt2img',
      'feat.bg.title': 'ลบพื้นหลัง',
      'feat.bg.text': 'อัปโหลดรูป แล้ว rembg จะตัดเฉพาะตัวแบบออกมา ได้ไฟล์ PNG พื้นใส',
      'feat.bg.png': 'PNG พื้นใส',
      'feat.hm.title': 'Histogram Matching (จับคู่สี)',
      'feat.hm.text': 'ยืมโทนสีจากรูปหนึ่งไปใส่อีกรูป โดยจับคู่ฮิสโทแกรมของแต่ละช่องสี RGB ผ่าน CDF',
      'feat.hm.source': 'ภาพต้นฉบับ',
      'feat.hm.ref': 'ภาพอ้างอิง',
      'feat.hm.result': 'ผลลัพธ์!',
      'feat.hm.proof': 'ผลจริงจาก <code>hismat.py</code>',
      'feat.blur.title': 'Gaussian Blur (เบลอภาพ)',
      'feat.blur.text': 'ทำภาพให้นุ่มลงได้ 3 ระดับ เบา กลาง แรง ลากเส้นตรงกลางเพื่อเทียบได้เลย',
      'feat.blur.proof': 'ผลจริงจาก <code>blur.py</code> ระดับ high',
      'feat.gray.title': 'ขาวดำ & เพิ่ม Contrast',
      'feat.gray.text': 'แปลงภาพเป็นขาวดำ แล้วยืด contrast ด้วย Histogram Equalization',
      'feat.gray.proof': 'ผลจริงจาก <code>contrast.py</code>',
      'cmp.before': 'ก่อน',
      'cmp.after': 'หลัง',
      'cmp.aria': 'เลื่อนเทียบภาพก่อนและหลัง',

      'how.title': 'ทำงานยังไง',
      'how.sub': 'คอมพิวเตอร์ 4 เครื่องในเครือข่ายเดียวกัน แต่ละเครื่องมีหน้าที่ของตัวเอง',
      'how.browser': 'เบราว์เซอร์',
      'how.browser.1': 'ผู้ใช้เปิด LUMA',
      'how.pc1.1': 'ให้บริการหน้าเว็บ',
      'how.pc1.2': 'Reverse proxy สำหรับ /api/*',
      'how.pc3.1': 'API และระบบล็อกอิน',
      'how.pc3.2': 'เบลอ, จับคู่สี, ปรับ contrast',
      'how.pc3.3': 'คุยกับ AI และฐานข้อมูล',
      'how.pc2.1': 'สร้างภาพจากข้อความ',
      'how.pc2.2': 'ลบพื้นหลัง (rembg)',
      'how.pc4.1': 'ข้อมูลผู้ใช้',
      'how.pc4.2': 'ประวัติงานสร้างภาพ',
      'how.note.browser': 'ผู้ใช้เปิดเว็บตรงนี้!',
      'how.note.backend': 'รับคำขอ จัดการงาน และล็อกอิน',
      'how.note.nginx': 'ส่งต่อทุกคำขอ',
      'how.note.data': 'AI วาด ฐานข้อมูลจำ',

      'team.title': 'ทีมของเรา',
      'team.db': 'ฐานข้อมูล',
      'team.fe': 'ฟรอนต์เอนด์',
      'team.be': 'แบ็กเอนด์',
      'team.ops': 'DevOps + AI',

      'cta.title': 'พร้อมสร้างอะไรสักอย่างหรือยัง?',
      'cta.text': 'เข้าสู่ระบบ แล้วภาพแรกของคุณก็ห่างไปแค่ประโยคเดียว',
      'cta.open': 'เปิด Workspace',

      'footer.made': 'LUMA Group11 · โปรเจกต์วิชา Image Processing',
      'footer.photos': 'ภาพตัวอย่าง:'
    }
  };

  let lang = document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en';

  function t(key) {
    return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || '';
  }

  // ========================================
  // ปุ่ม Workspace (home.js เปลี่ยนปุ่มเป็นภาษาอังกฤษตอนล็อกอินอยู่)
  // แปลทับให้ตรงกับภาษาที่เลือก โดยไม่ต้องแก้ home.js
  // ========================================

  const authButtons = [
    { id: 'navStartBtn', key: 'nav.workspace', icon: 'bi-palette me-1' },
    { id: 'heroCtaBtn', key: 'hero.workspace', icon: 'bi-palette me-2' }
  ];

  const observer = new MutationObserver(() => syncAuthButtons());

  function syncAuthButtons() {
    observer.disconnect();

    authButtons.forEach(({ id, key, icon }) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const loggedIn = (btn.getAttribute('href') || '').endsWith('/generate');
      if (loggedIn) {
        btn.innerHTML = `<i class="bi ${icon}"></i> <span data-i18n="${key}"></span>`;
        btn.querySelector('span').textContent = t(key);
      }

      observer.observe(btn, { childList: true, attributes: true, attributeFilter: ['href'] });
    });
  }

  // ========================================
  // ใส่คำแปลลงหน้า
  // ========================================

  function applyLanguage(next) {
    lang = next === 'th' ? 'th' : 'en';
    document.documentElement.setAttribute('lang', lang);
    document.title = t('page.title');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });

    // ข้อความที่มี <code> (มาจาก DICT ด้านบนเท่านั้น)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.querySelectorAll('#langToggleBtn [data-lang]').forEach(span => {
      span.classList.toggle('is-active', span.dataset.lang === lang);
    });

    syncAuthButtons();
  }

  // ========================================
  // ปุ่ม TH | EN
  // ========================================

  const langBtn = document.getElementById('langToggleBtn');

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const next = lang === 'th' ? 'en' : 'th';

      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        // เบราว์เซอร์ไม่ให้เก็บค่า ก็ยังสลับภาษาได้ในหน้านี้
      }

      applyLanguage(next);
    });
  }

  applyLanguage(lang);

  // ========================================
  // Slider เทียบภาพ before / after
  // ========================================

  document.querySelectorAll('.sk-compare').forEach(box => {
    const range = box.querySelector('input[type="range"]');
    if (!range) return;

    const update = () => box.style.setProperty('--pos', range.value + '%');
    range.addEventListener('input', update);
    update();
  });

  // ========================================
  // ค่อยๆ โผล่ตอนเลื่อนถึง + ไฮไลต์เมนูตาม section
  // ========================================

  const reveals = document.querySelectorAll('.sk-reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => revealObserver.observe(el));

  const navLinks = document.querySelectorAll('.sk-nav__links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['features', 'how', 'team'].forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

})();
