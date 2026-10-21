/**
 * API client helper - CellphoneS 241 Lê Văn Việt
 */
var API_BASE = window.API_BASE = window.API_BASE || ((window.location.protocol === 'file:' || window.location.port === '5500')
    ? 'http://localhost:8080/api'
    : '/api');

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
        headers['X-Auth-Token'] = token;
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
        } else if (!isAdmin) {
            alert('Phiên đã hết hạn');
        }
        throw new Error('Phiên đã hết hạn');
    }
    if (res.status === 403) {
        alert('Bạn không có quyền thực hiện chức năng này');
        throw new Error('Bạn không có quyền thực hiện chức năng này');
    }
}

const api = {
    async get(path) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            handleAuthStatus(res);
            let errorMsg = `GET ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.error) errorMsg = err.error;
                else if (err.message) errorMsg = err.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        return res.json();
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
            let errorMsg = `POST ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.error) errorMsg = err.error;
                else if (err.message) errorMsg = err.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        return res.json();
    },

    async put(path, data) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            handleAuthStatus(res);
            let errorMsg = `PUT ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.error) errorMsg = err.error;
                else if (err.message) errorMsg = err.message;
            } catch (e) {}
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
            let errorMsg = `DELETE ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.error) errorMsg = err.error;
                else if (err.message) errorMsg = err.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        return true;
    }
};

window.api = api;
