// =========================================================================
// SAMAMOBILE - SIGNALR REALTIME ORDER NOTIFICATION SYSTEM
// Kết nối realtime 2 chiều:
// 1. Khách đặt hàng -> Gửi realtime thông báo tới Admin ngay lập tức
// 2. Admin cập nhật/lên đơn -> Gửi realtime thông báo tới Khách hàng ngay lập tức
// =========================================================================

(function () {
  'use strict';

  // Âm chuông thông báo Web Audio API (Không phụ thuộc file mp3 ngoài)
  function playChime(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const freqs = type === 'new_order'
        ? [523.25, 659.25, 783.99, 1046.50] // C5 -> E5 -> G5 -> C6 (Chuông đơn mới Admin)
        : [587.33, 783.99, 1174.66]; // D5 -> G5 -> D6 (Chuông đơn được duyệt User)

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch (e) {}
  }

  // Tự động tìm Hub URL SignalR
  function getHubUrl() {
    let apiBase = window.API_BASE || '';
    if (!apiBase) {
      const isLocal = window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5501';
      apiBase = isLocal ? 'http://localhost:5132/api' : '/api';
    }
    const root = apiBase.replace(/\/api\/?$/, '');
    return (root || '') + '/hubs/order';
  }

  // Quản lý deduplicate thông báo realtime
  const recentStatusUpdates = new Map();

  // Banner thông báo realtime nổi bật trên màn hình User
  function showUserRealtimeOrderBanner(data) {
    let container = document.getElementById('signalr-user-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'signalr-user-toast-container';
      container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-[420px] w-full pointer-events-none p-3';
      document.body.appendChild(container);
    }

    // Nếu đã có thông báo của chính đơn hàng này đang hiển thị thì gỡ bỏ trước khi tạo mới (tránh lặp)
    if (data && data.maDH) {
      const existingToast = container.querySelector(`[data-order-toast="${data.maDH}"]`);
      if (existingToast) {
        existingToast.remove();
      }
    }

    const toast = document.createElement('div');
    toast.dataset.orderToast = data.maDH || '';
    toast.className = 'pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-4 transition-all duration-300 transform translate-y-2 opacity-0 flex items-start gap-3.5';

    let iconBg = 'bg-emerald-500';
    let icon = 'fa-circle-check';
    let title = 'ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN!';
    let badgeColor = 'bg-emerald-100 text-emerald-800';

    if (data.trangThai === 'dang_giao') {
      iconBg = 'bg-blue-600';
      icon = 'fa-truck-fast';
      title = 'ĐƠN HÀNG ĐANG ĐƯỢC GIAO!';
      badgeColor = 'bg-blue-100 text-blue-800';
    } else if (data.trangThai === 'hoan_thanh') {
      iconBg = 'bg-emerald-600';
      icon = 'fa-box-open';
      title = 'ĐƠN HÀNG ĐÃ HOÀN TẤT!';
      badgeColor = 'bg-emerald-100 text-emerald-800';
    } else if (data.trangThai === 'da_huy') {
      iconBg = 'bg-rose-500';
      icon = 'fa-ban';
      title = 'ĐƠN HÀNG ĐÃ HỦY!';
      badgeColor = 'bg-rose-100 text-rose-800';
    }

    toast.innerHTML = `
      <div class="w-10 h-10 rounded-xl ${iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-md">
        <i class="fa-solid ${icon} text-lg"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-black tracking-wide text-slate-800 uppercase">${title}</span>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${badgeColor}">${data.maDH}</span>
        </div>
        <p class="text-xs sm:text-[13px] text-slate-700 leading-snug font-medium mb-1.5">${data.message || data.statusText || 'Đơn hàng của bạn đã được cập nhật thành công!'}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-400">
          <span>Thời gian: ${new Date().toLocaleTimeString('vi-VN')}</span>
          <a href="cart.html#orders" onclick="window.switchCartTab && window.switchCartTab('orders')" class="text-[#0057B7] hover:underline font-bold">Xem đơn hàng &rarr;</a>
        </div>
      </div>
      <button type="button" class="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 cursor-pointer">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    if (closeBtn) {
      closeBtn.onclick = () => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      };
    }

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }
    }, 8000);
  }

  // Quản lý kết nối SignalR
  let connection = null;
  let isConnecting = false;

  async function initSignalR() {
    if (typeof signalR === 'undefined') {
      console.warn('SignalR library not loaded yet.');
      return null;
    }
    if (connection) return connection;

    const hubUrl = getHubUrl();
    console.log('Connecting to Order SignalR Hub at:', hubUrl);

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Lắng nghe sự kiện: Đơn hàng mới (dành cho Admin)
    connection.on('ReceiveNewOrder', function (order) {
      console.log('SignalR: ReceiveNewOrder', order);
      playChime('new_order');

      // Dispatch CustomEvent
      window.dispatchEvent(new CustomEvent('samamobile:new_order', { detail: order }));
    });

    // Lắng nghe sự kiện: Trạng thái đơn thay đổi (dành cho User & Admin)
    connection.on('OrderStatusUpdated', function (data) {
      if (!data) return;

      // Deduplicate tránh lặp thông báo trong vòng 3 giây cho cùng 1 trạng thái của đơn
      const dedupKey = `${data.maDH || ''}_${data.trangThai || ''}`;
      const now = Date.now();
      if (recentStatusUpdates.has(dedupKey) && (now - recentStatusUpdates.get(dedupKey) < 3000)) {
        console.log('SignalR: Bỏ qua thông báo trùng lặp (dedup):', dedupKey);
        return;
      }
      recentStatusUpdates.set(dedupKey, now);

      console.log('SignalR: OrderStatusUpdated', data);
      playChime('order_status');

      // Dispatch CustomEvent
      window.dispatchEvent(new CustomEvent('samamobile:order_status_updated', { detail: data }));
      
      // Hiển thị banner cho User nếu đơn hàng thuộc sở hữu của User
      try {
        const raw = localStorage.getItem('samamobile_user_orders');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find(o => o.maDH === data.maDH);
          if (found) {
            showUserRealtimeOrderBanner(data);
          }
        }
      } catch (e) {}
    });

    // Lắng nghe sự kiện: Đơn bị hủy
    connection.on('ReceiveOrderCancelled', function (data) {
      console.log('SignalR: ReceiveOrderCancelled', data);
      window.dispatchEvent(new CustomEvent('samamobile:order_cancelled', { detail: data }));
    });

    try {
      isConnecting = true;
      await connection.start();
      isConnecting = false;
      console.log('Connected to Order SignalR Hub successfully!');

      // Tự động join các group theo ngữ cảnh trang
      const isCustomerPage = window.location.pathname.includes('cart.html') || window.location.pathname.includes('index.html');
      const isAdminPage = window.location.pathname.includes('admin.html');

      if (isAdminPage) {
        await connection.invoke('JoinAdminGroup');
        console.log('Joined SignalR AdminGroup');
      }

      if (isCustomerPage) {
        // Lấy SĐT từ các đơn hàng đã lưu để join group
        try {
          const raw = localStorage.getItem('samamobile_user_orders');
          if (raw) {
            const list = JSON.parse(raw);
            list.forEach(o => {
              if (o.maDH) connection.invoke('JoinOrderGroup', o.maDH).catch(() => {});
              if (o.sdtNguoiNhan) connection.invoke('JoinCustomerGroup', o.sdtNguoiNhan).catch(() => {});
            });
          }
        } catch (e) {}
      }

    } catch (err) {
      isConnecting = false;
      console.warn('Cannot connect to SignalR Hub (Backend might be offline or starting):', err);
    }

    return connection;
  }

  // Tự động khởi tạo sau khi trang load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSignalR();
    });
  } else {
    initSignalR();
  }

  // Public API để các module khác gọi trực tiếp
  window.OrderSignalR = {
    getConnection: () => connection,
    playChime: playChime,
    showUserRealtimeOrderBanner: showUserRealtimeOrderBanner,
    notifyNewOrder: async function (orderData) {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke('NotifyNewOrder', orderData);
          console.log('Notified new order via SignalR successfully');
        } catch (e) {
          console.warn('Failed to send NotifyNewOrder via SignalR:', e);
        }
      }
    },
    notifyOrderStatusChanged: async function (maDH, trangThai, message, phone) {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke('NotifyOrderStatusChanged', maDH, trangThai, message, phone || '');
          console.log('Notified order status changed via SignalR successfully');
        } catch (e) {
          console.warn('Failed to send NotifyOrderStatusChanged via SignalR:', e);
        }
      }
    },
    joinOrderGroup: function (maDH) {
      if (connection && connection.state === signalR.HubConnectionState.Connected && maDH) {
        connection.invoke('JoinOrderGroup', maDH).catch(() => {});
      }
    },
    joinCustomerGroup: function (phone) {
      if (connection && connection.state === signalR.HubConnectionState.Connected && phone) {
        connection.invoke('JoinCustomerGroup', phone).catch(() => {});
      }
    }
  };

})();
