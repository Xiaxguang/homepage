const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const toast = document.querySelector('.toast');
const waveform = document.querySelector('.waveform');

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

let toastTimer;
function showToast(message = '示意播放器：加入你的音檔後即可播放') {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.demo-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    waveform?.classList.toggle('playing');
    showToast();
  });
});

document.querySelectorAll('.beat-filters button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.beat-filters button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.beat-row').forEach((row) => {
      row.classList.toggle('is-hidden', filter !== 'all' && row.dataset.genre !== filter);
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get('name');
  const service = data.get('service');
  const message = data.get('message');
  const subject = encodeURIComponent(`音樂製作合作詢問｜${service}｜${name}`);
  const body = encodeURIComponent(`阿光你好，我是 ${name}。\n\n想詢問的項目：${service}\n\n作品與需求：\n${message}\n\n期待你的回覆，謝謝！`);
  window.location.href = `mailto:a26926291@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById('year').textContent = new Date().getFullYear();
