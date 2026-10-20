/**
 * API client helper - CellphoneS 241 Lê Văn Việt
 */
var API_BASE = window.API_BASE = window.API_BASE || ((window.location.protocol === 'file:' || window.location.port === '5500')
    ? 'http://localhost:8080/api'
    : '/api');

function getAuthHeaders(extraHeaders = {}) {
    const headers = { ...extraHeaders };
    let token = (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null) 
        || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_token') : null);
    if (!token) {
        try {
            const userStr = localStorage.getItem('auth_user');
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

const api = {
    async get(path) {
        const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
        const res = await fetch(url, {
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            let errorMsg = `GET ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.message) errorMsg = err.message;
                else if (err.error) errorMsg = err.error;
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
            let errorMsg = `POST ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.message) errorMsg = err.message;
                else if (err.error) errorMsg = err.error;
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
            let errorMsg = `PUT ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.message) errorMsg = err.message;
                else if (err.error) errorMsg = err.error;
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
            let errorMsg = `DELETE ${path} thất bại (${res.status})`;
            try {
                const err = await res.json();
                if (err.message) errorMsg = err.message;
                else if (err.error) errorMsg = err.error;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        return true;
    }
};

window.api = api;
