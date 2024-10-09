(function(Scratch) {
    'use strict';

    class ScrollingTextBubble {
        constructor() {
            this.bubbles = {};
            this.defaultBubbleStyle = {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'black',
                borderWidth: '2px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                padding: '15px' // Valeur par défaut du padding
            };
        }

        getInfo() {
            return {
                id: 'scrollingTextBubble',
                name: 'Scrolling Text Bubble',
                blocks: [
                    {
                        opcode: 'showTextBubble',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'show text bubble with text [TEXT] next to sprite with speed [SPEED], font [FONT], width [WIDTH], offsetX [OFFSETX], offsetY [OFFSETY]',
                        arguments: {
                            TEXT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, World!'
                            },
                            SPEED: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            FONT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Arial'
                            },
                            WIDTH: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 200
                            },
                            OFFSETX: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            OFFSETY: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: -60
                            }
                        },
                        filter: [Scratch.TargetType.SPRITE]
                    },
                    {
                        opcode: 'hideTextBubble',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'hide text bubble',
                        filter: [Scratch.TargetType.SPRITE]
                    },
                    {
                        opcode: 'hideAllTextBubbles',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'hide all text bubbles'
                    },
                    {
                        opcode: 'setBubbleColor',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set bubble color to [COLOR]',
                        arguments: {
                            COLOR: {
                                type: Scratch.ArgumentType.COLOR,
                                defaultValue: '#ffffff'
                            }
                        }
                    },
                    {
                        opcode: 'setBubbleStyle',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set bubble style to [STYLE]',
                        arguments: {
                            STYLE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'bubbleStyleMenu',
                                defaultValue: 'default'
                            }
                        }
                    },
                    {
                        opcode: 'setBubblePadding',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set bubble padding to [PADDING]',
                        arguments: {
                            PADDING: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 15 // Valeur par défaut pour le padding
                            }
                        }
                    }
                ],
                menus: {
                    bubbleStyleMenu: {
                        acceptReporters: true,
                        items: ['default', 'rounded', 'sharp', 'shadow', 'no-border']
                    }
                }
            };
        }

        // Afficher une bulle de texte avec des lettres qui apparaissent une à une
        showTextBubble(args, util) {
            const sprite = util.target;
            const text = args.TEXT;
            const speed = args.SPEED;
            const font = args.FONT;
            const width = args.WIDTH; // Largeur de la bulle
            const offsetX = args.OFFSETX; // Décalage X par rapport au sprite
            const offsetY = args.OFFSETY; // Décalage Y par rapport au sprite

            // Si une bulle est déjà active pour ce sprite, on l'arrête
            if (this.bubbles[sprite.id]) {
                clearInterval(this.bubbles[sprite.id].intervalId);
                this.bubbles[sprite.id].bubbleDiv.remove();
            }

            // Création de la bulle de texte
            const bubbleDiv = document.createElement('div');
            bubbleDiv.style.position = 'absolute';
            this.applyBubbleStyle(bubbleDiv); // Applique le style actuel de la bulle
            bubbleDiv.style.maxWidth = `${width}px`; // Utilisation de la largeur spécifiée
            bubbleDiv.style.overflow = 'hidden';
            bubbleDiv.style.whiteSpace = 'pre-wrap';
            bubbleDiv.style.fontFamily = font;
            bubbleDiv.style.color = 'black';
            bubbleDiv.style.fontSize = '16px';
            bubbleDiv.style.lineHeight = '1.5';

            const canvas = Scratch.renderer.canvas;
            const rect = canvas.getBoundingClientRect();

            // Crée un conteneur pour le texte qui sera rempli progressivement
            const textContainer = document.createElement('span');
            bubbleDiv.appendChild(textContainer);
            document.body.appendChild(bubbleDiv);

            // Gère la position de la bulle par rapport au sprite et applique les décalages
            const updateBubblePosition = () => {
                const { x, y } = sprite;

                // Calcul proportionnel pour le décalage basé sur la taille du canvas
                const proportionX = rect.width / 480; // Proportion en X
                const proportionY = rect.height / 360; // Proportion en Y

                // Appliquer les offsets proportionnellement
                const adjustedOffsetX = offsetX * proportionX;
                const adjustedOffsetY = offsetY * proportionY;

                bubbleDiv.style.left = `${rect.left + (x + 240) / 480 * rect.width + adjustedOffsetX}px`;
                bubbleDiv.style.top = `${rect.top + (180 - y) / 360 * rect.height + adjustedOffsetY}px`;
            };

            updateBubblePosition();
            window.addEventListener('mousemove', updateBubblePosition);

            // Prépare le texte formaté en HTML
            const formattedText = this.formatText(text);

            // Utilise un tableau pour découper le texte en lettres et balises HTML
            const textParts = this.splitText(formattedText);

            let index = 0;
            let currentHTML = '';

            // Fonction pour afficher les parties du texte une par une tout en maintenant le format HTML
            const intervalId = setInterval(() => {
                if (index < textParts.length) {
                    currentHTML += textParts[index];
                    textContainer.innerHTML = currentHTML;
                    index++;
                } else {
                    clearInterval(intervalId); // Arrête l'intervalle quand tout est affiché
                }
            }, speed);

            // Sauvegarde la bulle et l'ID du setInterval pour pouvoir l'arrêter plus tard
            this.bubbles[sprite.id] = { intervalId, bubbleDiv };
        }

        // Cacher la bulle de texte
        hideTextBubble(args, util) {
            const sprite = util.target;

            // Arrête l'affichage du texte si nécessaire
            if (this.bubbles[sprite.id]) {
                clearInterval(this.bubbles[sprite.id].intervalId);
                this.bubbles[sprite.id].bubbleDiv.remove();
                delete this.bubbles[sprite.id];
            }
        }

        // Cacher toutes les bulles de texte
        hideAllTextBubbles() {
            for (const spriteId in this.bubbles) {
                if (this.bubbles.hasOwnProperty(spriteId)) {
                    clearInterval(this.bubbles[spriteId].intervalId);
                    this.bubbles[spriteId].bubbleDiv.remove();
                    delete this.bubbles[spriteId];
                }
            }
        }

        // Changer la couleur de la bulle
        setBubbleColor(args) {
            const color = args.COLOR;
            this.defaultBubbleStyle.backgroundColor = color;
        }

        // Régler le padding de la bulle
        setBubblePadding(args) {
            const padding = args.PADDING;
            this.defaultBubbleStyle.padding = `${padding}px`; // Applique le padding personnalisé
        }

        // Applique le style de la bulle choisi dans le menu
        setBubbleStyle(args) {
            const style = args.STYLE;

            switch (style) {
                case 'rounded':
                    this.defaultBubbleStyle.borderRadius = '20px';
                    break;
                case 'sharp':
                    this.defaultBubbleStyle.borderRadius = '0px';
                    break;
                case 'shadow':
                    this.defaultBubbleStyle.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.5)';
                    break;
                case 'no-border':
                    this.defaultBubbleStyle.borderWidth = '0px';
                    break;
                default:
                    this.defaultBubbleStyle = {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'black',
                        borderWidth: '2px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        padding: '15px' // Définit le padding par défaut
                    };
                    break;
            }
        }

        // Applique le style actuel de la bulle à un élément DOM
        applyBubbleStyle(bubbleDiv) {
            bubbleDiv.style.backgroundColor = this.defaultBubbleStyle.backgroundColor;
            bubbleDiv.style.border = `${this.defaultBubbleStyle.borderWidth} solid ${this.defaultBubbleStyle.borderColor}`;
            bubbleDiv.style.borderRadius = this.defaultBubbleStyle.borderRadius;
            bubbleDiv.style.boxShadow = this.defaultBubbleStyle.boxShadow;
            bubbleDiv.style.padding = this.defaultBubbleStyle.padding; // Applique le padding ici
        }

        // Fonction utilitaire pour formater le texte avec des balises HTML
        formatText(text) {
            return text.replace(/(\{.*?\})/g, (match) => {
                try {
                    const jsonObj = JSON.parse(match);
                    let formattedWord = jsonObj.mot || '';

                    // Applique les styles gras, italique et la couleur si spécifiés
                    if (jsonObj.type === 'gras') {
                        formattedWord = `<b>${formattedWord}</b>`;
                    }
                    if (jsonObj.type === 'italic' || jsonObj.type1 === 'italic') {
                        formattedWord = `<i>${formattedWord}</i>`;
                    }
                    if (jsonObj.color) {
                        formattedWord = `<span style="color:${jsonObj.color}">${formattedWord}</span>`;
                    }

                    return formattedWord;
                } catch (e) {
                    return match; // Si ce n'est pas un JSON valide, on retourne le texte tel quel
                }
            });
        }

        // Fonction pour découper le texte tout en conservant les balises HTML complètes
        splitText(text) {
            const parts = [];
            const tagRegex = /<\/?[^>]+>/g; // Regex pour trouver les balises HTML
            let lastIndex = 0;

            text.replace(tagRegex, (match, index) => {
                // Ajouter le texte entre les balises
                if (index > lastIndex) {
                    parts.push(...text.slice(lastIndex, index).split('')); // Ajoute les lettres une par une
                }
                // Ajouter la balise entière
                parts.push(match);
                lastIndex = index + match.length;
            });

            // Ajouter le texte restant après la dernière balise
            if (lastIndex < text.length) {
                parts.push(...text.slice(lastIndex).split(''));
            }

            return parts;
        }
    }

    Scratch.extensions.register(new ScrollingTextBubble());
})(Scratch);
