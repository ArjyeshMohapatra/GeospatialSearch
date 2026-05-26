import { Routes } from '@angular/router';

export const SIGNUP_ROUTES: Routes = [

    {
        path: '',
        loadComponent: () =>
            import('./sign-up')
            .then(c => c.SignUp)
    },
];