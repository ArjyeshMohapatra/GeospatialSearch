import { Routes } from '@angular/router';
import { SignIn } from './features/auth/sign-in/sign-in';
import { guestGuard } from './core/guards/guest-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'signin',
        pathMatch: 'full'
    },
    {
        path: 'signin',
        component: SignIn,
        canActivate: [guestGuard]
    },
    {
        path: 'signup',
        loadChildren: () =>
            import('./features/auth/sign-up/sign-up.routes')
                .then(r => r.SIGNUP_ROUTES),
        canActivate: [guestGuard]
    },
    {
        path: 'map-dashboard',
        loadChildren: () => 
            import('./features/map-view/map-dashboard/map-dashboard.routes')
                .then(r => r.MAP_DASHBOARD_ROUTES),
        canActivate: [authGuard]
    }
];