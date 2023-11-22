const loginImg = new URL("../../img/journal.jpg", import.meta.url)

export class LoginTemplate {
  static template() {
    return `
            <div class="login-container">
                <header>
                  <nav class="login-header">
                    <ul>
                      <li class="cta-btn cta-btn-login">Login</li>
                      <li class="cta-btn cta-btn-signup">Sign Up</li>
                    </ul>
                  </nav>
                </header>
                <div class="login-content">
                  <div class="login-heading-row">
                    <div class="login-content-heading">
                      Start your Journaling journey Today
                    </div>
                    <p class="login-content-text">
                      Take your Daily Experiences to an accountable level. Keep track of the momentums that got you to where you are now. Start Today!
                    </p>
                  </div>
                  <div class="login-content-row">
                    <div class="login-content-outline">
                      <div class="content-outlines">
                        <div class="content-outline">
                          <div class="outline-heading">
                            1. Start writing
                          </div>
                          <div class="outline-text">
                            Get your experiences written down. Budget time to reflect on your day.
                          </div>
                        </div>
                        <div class="content-outline">
                          <div class="outline-heading">
                            2. Tag it
                          </div>
                          <div class="outline-text">
                            Create tags to culminate your experience to keep track of it.
                          </div>
                        </div>
                        <div class="content-outline">
                          <div class="outline-heading">
                            3. Reflect and grow
                          </div>
                          <div class="outline-text">
                            Get to reflect on your experiences and daily activities for growth.
                          </div>
                      
                        </div>
                      </div>
                      <div class="content-img">
                        <div class="content-img-box">
                        
                          <img src="${loginImg.href}" alt="Diaries for Journaling stacked on each other">
                          <div class="img-overlay">
                            <ul>
                              <li class="cta-btn cta-btn-login">Login</li>
                              <li class="cta-btn cta-btn-signup">Sign Up</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        `;
  }

  static templateStyling() {
    document.querySelector("html").style.fontSize = "100%";
  }
}
