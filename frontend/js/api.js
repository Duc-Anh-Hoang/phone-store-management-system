/**
 * API client helper - CellphoneS / SamaMobile 241 Lê Văn Việt
 */
var API_BASE = window.API_BASE = window.API_BASE || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (
  (window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5501' || window.location.port === '3000')
    ? 'http://localhost:5132/api'
    : '/api'
);

// Tự động phát hiện nếu developer đang chạy dotnet run ở cổng 5132
if (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.port === '5500' || window.location.port === '5501')) {
  fetch('http://localhost:5132/api/health', { method: 'GET', signal: AbortSignal.timeout(800) })
    .then(r => { if (r.ok) { window.API_BASE = API_BASE = 'http://localhost:5132/api'; } })
    .catch(() => {});
}

function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    let token = (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null) 
        || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_token') : null)
        || (typeof localStorage !== 'undefined' ? localStorage.getItem('customer_token') : null);
    if (!token) {
        try {
            const userStr = localStorage.getItem('cellphones_auth_user') || localStorage.getItem('auth_user');
            if (userStr) {
                const u = JSON.parse(userStr);
                if (u && u.token) token = u.token;
            }
        } catch (e) {}
    }
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        // Đã bỏ X-Auth-Token dư thừa theo chuẩn P1-11
    }
    return headers;
}
window.getAuthHeaders = getAuthHeaders;

function handleAuthStatus(res) {
    if (res.status === 401) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('customer_token');
            localStorage.removeItem('cellphones_auth_user');
        }
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('admin_token');
        }
        const isAdmin = typeof window !== 'undefined' && (window.location.pathname.includes('admin') || window.location.href.includes('admin.html'));
        if (isAdmin && typeof window.showAdminLoginScreen === 'function') {
            window.showAdminLoginScreen('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (typeof window.showToast === 'function') {
            window.showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
        }
        throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    }

    if (res.status === 403) {
        if (typeof window.showToast === 'function') {
            window.showToast('Bạn không có quyền thực hiện chức năng này.', 'error');
        }
        throw new Error('Bạn không có quyền thực hiện chức năng này.');
    }
}

async function parseErrorMessage(res, defaultMsg) {
    let errorMsg = defaultMsg;
    try {
        const err = await res.json();
        if (err.message) {
            errorMsg = err.message;
            if (Array.isArray(err.errors) && err.errors.length > 0) {
                errorMsg += ' (' + err.errors.join('; ') + ')';
            }
        } else if (err.error) {
            errorMsg = err.error;
        }
    } catch (e) {}
    return errorMsg;
}

const api = {
    async get(path) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            handleAuthStatus(res);
            const errorMsg = await parseErrorMessage(res, `GET ${path} thất bại (${res.status})`);
            throw new Error(errorMsg);
        }
        return res.json();
    },

    async getWithHeaders(path) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            handleAuthStatus(res);
            const errorMsg = await parseErrorMessage(res, `GET ${path} thất bại (${res.status})`);
            throw new Error(errorMsg);
        }
        const totalCount = parseInt(res.headers.get('X-Total-Count') || res.headers.get('x-total-count') || '0', 10);
        const data = await res.json();
        return { data, totalCount, headers: res.headers };
    },

    async post(path, data) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            handleAuthStatus(res);
            const errorMsg = await parseErrorMessage(res, `POST ${path} thất bại (${res.status})`);
            throw new Error(errorMsg);
        }
        return res.json();
    },

    async put(path, data) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: data !== undefined ? JSON.stringify(data) : undefined
        });
        if (!res.ok) {
            handleAuthStatus(res);
            const errorMsg = await parseErrorMessage(res, `PUT ${path} thất bại (${res.status})`);
            throw new Error(errorMsg);
        }
        return res.json();
    },

    async delete(path) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            handleAuthStatus(res);
            const errorMsg = await parseErrorMessage(res, `DELETE ${path} thất bại (${res.status})`);
            throw new Error(errorMsg);
        }
        return res.json().catch(() => true);
    }
};

window.api = api;
