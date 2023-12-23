export type emailProps = {
    onTypeLogin: (type: string) => void;
    email: string;
    setEmail: (value: string) => void;
  }
export type verifyProps = {
  onTypeLogin: (type: string) => void;
  email: string;
}