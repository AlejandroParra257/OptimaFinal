import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const { user, isAdmin } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [emailEdit, setEmailEdit] = useState('');
    const [passwordEdit, setPasswordEdit] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            
            if (!tokenFromStorage) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:4000/api/admin/usuarios', {
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.success) {
                setUsuarios(data.usuarios);
            } else {
                setError(data.error || 'Error al cargar usuarios');
            }
        } catch (err) {
            console.error('Error completo:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const cambiarRol = async (userId, nuevoRolId) => {
        try {
            const tokenFromStorage = localStorage.getItem('token');
            
            const res = await fetch(`http://localhost:4000/api/admin/usuarios/${userId}/rol`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenFromStorage}`
                },
                body: JSON.stringify({ rol_id: nuevoRolId })
            });
            
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            
            const data = await res.json();
            if (data.success) {
                cargarUsuarios();
            } else {
                alert('Error al cambiar rol: ' + data.error);
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error de conexión');
        }
    };

    const eliminarUsuario = async (userId, userNombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar a ${userNombre}?`)) {
            return;
        }

        try {
            const tokenFromStorage = localStorage.getItem('token');
            
            const res = await fetch(`http://localhost:4000/api/admin/usuarios/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${tokenFromStorage}`
                }
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert('Usuario eliminado correctamente');
                cargarUsuarios();
            } else {
                alert('Error al eliminar: ' + data.error);
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error de conexión');
        }
    };

    const abrirModalEdicion = (usuario) => {
        setUsuarioEditando(usuario);
        setEmailEdit(usuario.email);
        setPasswordEdit('');
        setModalAbierto(true);
    };

    const guardarEdicion = async () => {
        if (!emailEdit && !passwordEdit) {
            alert('No hay cambios para guardar');
            return;
        }

        setEditLoading(true);
        try {
            const tokenFromStorage = localStorage.getItem('token');
            
            const res = await fetch(`http://localhost:4000/api/admin/usuarios/${usuarioEditando.id}/datos`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenFromStorage}`
                },
                body: JSON.stringify({
                    email: emailEdit !== usuarioEditando.email ? emailEdit : undefined,
                    password: passwordEdit || undefined
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert('Usuario actualizado correctamente');
                setModalAbierto(false);
                cargarUsuarios();
            } else {
                alert('Error al actualizar: ' + data.error);
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Error de conexión');
        } finally {
            setEditLoading(false);
        }
    };

    const getRolNombre = (rol) => {
        const roles = {
            'admin': 'Administrador',
            'vip': 'VIP',
            'no_vip': 'No VIP'
        };
        return roles[rol] || rol;
    };

    const getRolColor = (rol) => {
        const colores = {
            'admin': '🔴',
            'vip': '🟢',
            'no_vip': '🟡'
        };
        return colores[rol] || '⚪';
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'Nunca';
        return new Date(fecha).toLocaleDateString();
    };

    // Calcular estadísticas directamente desde usuarios (sin gráfica)
    const totalUsuarios = usuarios.length;
    const vipCount = usuarios.filter(u => u.rol === 'vip').length;
    const noVipCount = usuarios.filter(u => u.rol === 'no_vip').length;
    const adminCount = usuarios.filter(u => u.rol === 'admin').length;

    if (loading) {
        return <div className="loading">Cargando usuarios...</div>;
    }

    return (
        <div className="admin-panel-container">
            {/* ===== HEADER CON ESTADÍSTICAS ===== */}
            <div className="admin-panel-header">
                <h2>👑 Panel de Administración</h2>
                <div style={{ display: 'flex', gap: '30px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffb26b' }}>{totalUsuarios}</span>
                        <p style={{ margin: 0, opacity: 0.8 }}>Total</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>{vipCount}</span>
                        <p style={{ margin: 0, opacity: 0.8 }}>VIP</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>{noVipCount}</span>
                        <p style={{ margin: 0, opacity: 0.8 }}>No VIP</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>{adminCount}</span>
                        <p style={{ margin: 0, opacity: 0.8 }}>Admins</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    ⚠️ Error: {error}
                </div>
            )}

            {usuarios.length === 0 ? (
                <div className="empty-msg">No hay usuarios registrados</div>
            ) : (
                <div className="admin-panel-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Registro</th>
                                <th>Último acceso</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u, index) => (
                                <tr key={u.id}>
                                    <td>{index + 1}</td>
                                    <td>{u.nombre}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`rol-badge rol-${u.rol}`}>
                                            {getRolColor(u.rol)} {getRolNombre(u.rol)}
                                        </span>
                                    </td>
                                    <td>{formatFecha(u.fecha_registro)}</td>
                                    <td>{formatFecha(u.ultimo_acceso)}</td>
                                    <td>
                                        <span className={`status-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {u.rol !== 'admin' ? (
                                                <select
                                                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                                                    value={u.rol_id}
                                                    className="rol-select"
                                                    style={{ marginRight: '8px', padding: '4px' }}
                                                >
                                                    <option value="2">VIP</option>
                                                    <option value="3">No VIP</option>
                                                </select>
                                            ) : (
                                                <span className="admin-badge" title="Administrador">👑</span>
                                            )}
                                            
                                            {/* Botones de acción */}
                                            <button
                                                onClick={() => abrirModalEdicion(u)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                title="Editar usuario"
                                            >
                                                ✏️
                                            </button>
                                            
                                            {u.rol !== 'admin' && (
                                                <button
                                                    onClick={() => eliminarUsuario(u.id, u.nombre)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#fee'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                    title="Eliminar usuario"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ===== MODAL DE EDICIÓN ===== */}
            {modalAbierto && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#1a3b5c' }}>
                            Editar usuario: {usuarioEditando?.nombre}
                        </h3>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={emailEdit}
                                onChange={(e) => setEmailEdit(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                Nueva contraseña (opcional)
                            </label>
                            <input
                                type="password"
                                value={passwordEdit}
                                onChange={(e) => setPasswordEdit(e.target.value)}
                                placeholder="Dejar vacío para no cambiar"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setModalAbierto(false)}
                                style={{
                                    padding: '10px 20px',
                                    background: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarEdicion}
                                disabled={editLoading}
                                style={{
                                    padding: '10px 20px',
                                    background: 'linear-gradient(135deg, #1a3b5c 0%, #2c4a6e 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: editLoading ? 'not-allowed' : 'pointer',
                                    opacity: editLoading ? 0.5 : 1
                                }}
                            >
                                {editLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;