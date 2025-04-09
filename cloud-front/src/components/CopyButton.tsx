import ClipboardJS from "clipboard";
import { useEffect, useState } from "react";

const CopyButton: React.FC<{ publicLink: string }> = ({ publicLink }) => {
    const [isCopied, setIsCopied] = useState(false);
  
    useEffect(() => {
      const clipboard = new ClipboardJS('.copy-btn');
  
      clipboard.on('success', () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
  
      clipboard.on('error', () => {
        alert('Не удалось скопировать ссылку');
      });
  
      return () => {
        clipboard.destroy();
      };
    }, []);
  
    return (
      <>
        <button className="copy-btn" data-clipboard-text={publicLink}>
          Копировать
        </button>
        {isCopied && <div className="copy-notification">Ссылка скопирована!</div>}
      </>
    );
  };
  
export default CopyButton;