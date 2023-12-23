export type User = {
    firstName?:string;
    lastName?:string;
    avatar: string;
    email: string;
    isActive: boolean;
    lang: string;
    lastOnline: string;
    role: string;
    username: string;
    _id: string;
  };

  export type Message = {
    _id: string;
    createdAt: string | undefined;
    message: string;
    receiver?: string;
    seen?: string;
    sender?: string;
    type: string;
    updatedAt?: string;
    userID1?: string;
    userID2?: string;
    reply?:string;
    edited?:string;
    replyUsername?: string;
    replyMessage?: string;
    replyType?: string;
    replyFile?: { 
      name: string ,
      type: string ,
      size:string ,
    };
    replyChatId: string;
  }
  export type ChatMessageProps = {
    message: Message;
    id: string | undefined;
    user: Record<string, any>;
    me: User;
    isSelected: boolean;
    replyActive?: string;
    onReplyClick: (id: string) => void;
  };

  export type MessageRefType = {
    current: HTMLDivElement | null;
  }
  
  export type NewMsgs = {
    index: number | undefined;
    id: string | undefined;
  };