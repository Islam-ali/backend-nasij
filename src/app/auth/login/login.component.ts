
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LoginService } from '../services/login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RippleModule, TranslateModule, AppFloatingConfigurator],
  providers: [LoginService, MessageService]
})
export class LoginComponent {
  email: string = '';

  password: string = '';

  checked: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService) { }

  onSubmit() {
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loginService.saveToken(response.data.token);
        this.loginService.saveUser(response.data.user);
        // this.loginService.getUser().subscribe({
        //   next: (user) => {
        //     this.loginService.user.next(user);
        //   },
        //   error: (error) => {
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'Error',
        //       detail: error.error.message,
        //       life: 1000
        //     });
        //   }
        // })

        // Redirect to returnUrl if exists, otherwise go to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        // toast error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message,
          life: 1000
        });
      }
    })
  }
}
