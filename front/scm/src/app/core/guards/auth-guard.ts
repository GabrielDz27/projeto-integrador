import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../../shared/services/usuario-service';

export const authGuard = () => {
    const auth = inject(UsuarioService);
    const router = inject(Router);
    if (auth.estaLogado()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};
