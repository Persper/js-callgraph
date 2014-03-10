if (!this.overlay) {
                        oc = this.overlay = new Element('canvas', size);
                        oc.className = 'flotr-overlay';
                        oc = oc.writeAttribute('style', 'position:absolute;left:0px;top:0px;');
                }