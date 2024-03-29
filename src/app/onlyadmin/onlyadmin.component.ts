import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../model/user.model';
import { AuthService } from '../services/auth.service';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onlyadmin',
  templateUrl: './onlyadmin.component.html',
  styleUrls: ['./onlyadmin.component.css']
})
export class OnlyadminComponent implements OnInit {
  
  
user = new User();
users: any[] = [];
username!:string;
deleted: boolean = false;
updated: boolean = false;
removed: boolean = false;
hasAdmin = false;
showAllMessages = false;
cannotUpdate! : string;
userImage!: string;

admin!: string;
  super!: string;
  yesadmin: boolean = false;

  curentUser:any;
  token!:any;
  userData: any;
  newData: any;
  roles:any;
  password!:string;

  constructor( private authService: AuthService ,
              private userService: UserService,
              private router: Router
              ) { }

  ngOnInit(): void {
    this.token =window.localStorage.getItem('jwt')
    this.curentUser= jwt_decode(this.token);
    //console.log(jwt_decode(token))
    this.findUserByEmail();
    this.chargeUsers();
  }

  
  chargeUsers() {
    this.userService.listeUsers().subscribe(users => {
      this.users = users;
      this.users.sort((a, b) => {
        if (a.roles.includes('SUPER_ADMIN') && !b.roles.includes('SUPER_ADMIN')) {
          return -1;
        } else if (a.roles.includes('ADMIN') && !b.roles.includes('ADMIN') && !b.roles.includes('SUPER_ADMIN')) {
          return -1;
        } else if (!a.roles.includes('ADMIN') && !a.roles.includes('SUPER_ADMIN') && b.roles.includes('ADMIN')) {
          return 1;
        } else if (!a.roles.includes('ADMIN') && !a.roles.includes('SUPER_ADMIN') && !b.roles.includes('ADMIN') && b.roles.includes('SUPER_ADMIN')) {
          return 1;
        } else {
          return 0;
        }
      });
    });
  }
  
  
  supprimerUser(user: User) {
    const dialog = document.createElement('dialog');
  
    dialog.innerHTML = `
      <style>
        .dialog-container {
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
        }
  
        .btn-primary {
          background-color: #f44336;
          color: #fff;
          border: none;
          padding:auto;
        }
        .btn-primary:hover {
          background-color: #f44336;
          color: rgb(0, 0, 0);
          cursor: pointer;
          transition: 0.5s all ease;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: #fff;
          border: none;
          padding:auto;
        }
        .btn-secondary:hover {
          background-color: #666666;
          color: #fff;
          border: none;
        }
      </style>
      <form class="form-group">
        <div class="dialog-container">
          <h2>Supprimer le compte</h2>
          <p>Etes-vous sûr de vouloir supprimer ce compte  ?</p>
          <button type="button" class="btn btn-primary" id="confirmButton" >Confirmer</button>
          <button type="button" class="btn btn-secondary" id="cancelButton">Annuler</button>
        </div>
      </form>
    `;
  
    const confirmButton = dialog.querySelector('#confirmButton')!;
    const cancelButton = dialog.querySelector('#cancelButton')!;
  
    confirmButton.addEventListener('click', () => {
      dialog.close();
  
      this.authService.supprimerUser(user.id).subscribe(() => {
        this.chargeUsers();
        this.deleted = true;
        setTimeout(() => {
          this.deleted = false;
        }, 2600);
      });
    });
  
    cancelButton.addEventListener('click', () => {
      dialog.close();
    });
  
    document.body.appendChild(dialog);
    dialog.showModal();
  }
  

  reloadPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }

  rechercherParUser(){
    this.userService.rechercherParUsername(this.username).
    subscribe(user => {
    this.users = user; 
    console.log(user)});
    }   
    
    removeRoleAdmin(user: User) {
      const dialog = document.createElement('dialog');
          
      dialog.innerHTML = `
        <style>
          .dialog-container {
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
    
          .form-group button {
            margin-right: 8px;
          }
          .btn-primary {
            background-color: #f44336;
            color: #fff;
            border: none;
            padding:auto;
          }
          .btn-primary:hover {
            background-color: #f44336;
            color: rgb(0, 0, 0);
            cursor: pointer;
            transition: 0.5s all ease;
          }
          .btn-secondary {
            background-color: #6c757d;
            color: #fff;
            border: none;
            padding:auto;
          }
          .btn-secondary:hover {
            background-color: #666666;
            color: #fff;
            border: none;
          }
        </style>
        <form class="form-group">
          <div class="dialog-container">
            <h2>Confirmation</h2>
            <p>Etes-vous sûr d'anuller le rôle ADMIN à cet utilisateur?</p>
            <br>
            <button type="button" class="btn btn-primary" id="confirmButton" >Confirmer</button>
            <button type="button" class="btn btn-secondary" id="cancelButton">Annuler</button>
          </div>
        </form>
      `;
    
      const confirmButton = dialog.querySelector('#confirmButton')!;
      confirmButton.addEventListener('click', () => {
        dialog.close();
        this.userService.removeRoleAdmin(user.id).subscribe(
          (response) => {
            console.log(response);
            // handle success
            this.removed = true; // execute action here
            setTimeout(() => {
              this.removed = false; 
            }, 4500);
            this.reloadPage(); // reload the page

          },
          (error) => {
            console.log(error);
            // handle error
          }
        );
      });
    
      const cancelButton = dialog.querySelector('#cancelButton')!;
      cancelButton.addEventListener('click', () => {
        dialog.close();
      });
    
      document.body.appendChild(dialog);
      dialog.showModal();
    }
    

    findUserByEmail(){
      this.userService.rechercherParEmail(this.curentUser?.email).subscribe(us => {
        console.log(us);
        if (us) {
          this.userData = us;
          this.username=this.userData.username;
          this.password=this.userData.password;
          this.roles=this.userData.roles;
          this.userImage = 'https://127.0.0.1:8000/uploads/' + this.userData.image;

        }
          if (this.roles.includes("SUPER_ADMIN")) {
            this.yesadmin = true;
          } else {
            this.yesadmin = false;
          }
      
      });
    }
    

    onLogout() {
      this.authService.logout();
    }




    updateRoleAdmin(user: User) {
      if(user.roles.includes('SUPER_ADMIN')) {
        this.cannotUpdate = "Tu ne peux pas modifier le rôle de SUPER_ADMIN.";
        setTimeout(() => {
          this.cannotUpdate = '';
        }, 3000); 
        return;
      }
      

      const dialog = document.createElement('dialog');
      dialog.innerHTML = `
        <style>
          .dialog-container {
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
    
          .form-group button {
            margin-right: 8px;
          }
          .btn-primary {
            background-color: #f44336;
            color: #fff;
            border: none;
            padding:auto;
          }
          .btn-primary:hover {
            background-color: #f44336;
            color: rgb(0, 0, 0);
            cursor: pointer;
            transition: 0.5s all ease;
          }
          .btn-secondary {
            background-color: #6c757d;
            color: #fff;
            border: none;
            padding:auto;
          }
          .btn-secondary:hover {
            background-color: #666666;
            color: #fff;
            border: none;
          }
        </style>
        <form class="form-group">
          <div class="dialog-container">
            <h2>Confirmation</h2>
            <p>Etes-vous sûr de mettre le rôle de cet utilisateur à ADMIN?</p>
            <br>
            <button type="button" class="btn btn-primary" id="confirmButton">Confirmer</button>
            <button type="button" class="btn btn-secondary" id="cancelButton">Annuler</button>
          </div>
        </form>
      `;
    
      const confirmButton = dialog.querySelector('#confirmButton')!;
      confirmButton.addEventListener('click', () => {
        dialog.close();
        this.userService.updateUserRole(user.id).subscribe(
          (response) => {
            console.log(response);
            // handle success
            this.updated = true; // execute action here
            setTimeout(() => {
              this.updated = false; 
            }, 4500);
            this.reloadPage(); // reload the page

          },
          (error) => {
            console.log(error);
            // handle error
          }
        );
      });
    
      const cancelButton = dialog.querySelector('#cancelButton')!;
      cancelButton.addEventListener('click', () => {
        dialog.close();
      });
    
      document.body.appendChild(dialog);
      dialog.showModal();
    }
    
}
