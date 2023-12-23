import { t } from 'i18next';
import moment from 'moment';
import toast from 'react-hot-toast';

const focusToEnd = (messageRef:React.MutableRefObject<HTMLDivElement | null>) => {
    const messageNode = messageRef.current;
    if (messageNode) {
      messageNode.focus();
      document.execCommand('selectAll', false, undefined);
      document.getSelection()?.collapseToEnd();
    }
  };


  const copyToClipboard = async ({text,message=t("textCopied"),status="success"}:{text:string,message?: string,status?:string}) => {
    try {
      await navigator.clipboard.writeText(text);
        status == 'success' ? toast.success(message) :toast.error(message)
    } catch (err) {
      console.error("Unable to copy to clipboard:", err);
    }
  };

  
  const formatCreatedAt = (createdAt:string) => {
    const dateObject = moment(createdAt);
  
    if (dateObject.isSame(moment(), 'day')) {
      return t("today");
    } else if (dateObject.isSame(moment().subtract(1, 'day'), 'day')) {
      return t("yesterday");
    } else if (dateObject.isSame(moment(), 'week')) {
      return t(dateObject.format('dddd').toLowerCase());
    } else if (dateObject.isSame(moment(), 'month')) {
      return dateObject.format('MMMM D');
    } else if (dateObject.isSame(moment(), 'year')) {
      return dateObject.format('MMMM D');
    } else {
      return dateObject.format('YYYY MMMM D');
    }
  };
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }


  export {focusToEnd,formatCreatedAt,isMobileDevice,copyToClipboard};


