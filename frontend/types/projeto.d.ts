declare namespace Projeto {
    type User = {
        id?: number;
        name: string;
        login: string;
        password: string;
        email: string;
    };

    type Recurso = {
        id?: number;
        nome: string;
        chave: string;
    }

    type Perfil = {
        id?: number;
        descricao: string;
    }

    type PerfilUsuario = {
        id?: number;
        perfil: Perfil;
        usuario: Usuario;
    }

    type PermissaoPerfilRecurso = {
        id?: number;
        perfil: Perfil;
        recurso: Recurso;
    }
}
