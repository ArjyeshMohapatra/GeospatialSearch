import { Routes } from '@angular/router';

export const MAP_DASHBOARD_ROUTES: Routes = [

    {
        path: '',
        loadComponent: () =>
            import('./map-dashboard')
            .then(c => c.MapDashboard)
    },
];