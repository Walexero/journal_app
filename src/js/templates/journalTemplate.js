import { svgMarkup } from "../helpers.js";

export class JournalTemplate {
  static template() {
    return `
            <main>
                <div class="container">
                  <div class="nav-sidebar"></div>
                  <div class="content-container">
                    <div class="row">
                      <div class="container-main-content">
                        <div class="row row-scroller">
                          <div class="table-container">
                            <div class="main-table">
                              <div class="row row-scroller-table">
                                <div class="main-table-head">
                                  <div class="main-table-head-box">
                                  </div>
                                </div>
                            
                                <div class="property-container">
                                  <div class="property-actions"></div>
                                  <div class="div-filler"></div>
                                </div>
                                <div class="main-table-row">
                                  <!-- swith table to div start -->
                                
                                  <div role="tablerow" aria-label="Journals">
                                    <div role="tablehead">
                                      <div class="tableInput-container">
                                        <label class="tableInput">
                                          <input
                                            type="checkbox"
                                            name=""
                                            id="checkboxInput"
                                            class="checkboxInput"
                                          />
                                        </label>
                                      </div>
                                      <div role="rowgroup">
                                        <div role="row">
                                          <span role="columnhead">
                                            <div class="action-filter-content">
                                              <div class="action-filter-icon">
                                                ${svgMarkup(
                                                  "filter-icon",
                                                  "alphabet-icon"
                                                )}
                                              </div>
                                              <div class="action-filter-text">Name</div>
                                            </div>
                                          </span>
                                          <span role="columnhead">
                                            <div class="action-filter-content">
                                              <div class="action-filter-icon">
                                                ${svgMarkup(
                                                  "filter-icon",
                                                  "clock"
                                                )}
                                              </div>
                                          
                                              <div class="action-filter-text">
                                                Created
                                              </div>
                                            </div>
                                          </span>
                                          <span role="columnhead">
                                            <div class="action-filter-content">
                                              <div class="action-filter-icon">
                                                ${svgMarkup(
                                                  "filter-icon",
                                                  "list-icon"
                                                )}
                                              </div>
                                              <div class="action-filter-text">Tags</div>
                                            </div>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              
                                  <!-- table row adder -->
                                  <!-- switch table to div end -->
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="overlay-container">
                  <div class="overlay-container-base">
                    <div class="overlay">
                      <div>
                        <div class="overlay-filler"></div>
                        <div class="overlay-content" style="top: 200px; left: 900px">
                          <div></div>
                          <div class="overlay-content-holder">
                            <div class="overlay-content-content"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div class="alert-box">
                  <div class="alert-msg">ksdlfjsldf</div>
                </div> -->
            </main>
        `;
  }

  static templateStyling() {
    document.querySelector("html").style.fontSize = "62.5%";
  }
}
