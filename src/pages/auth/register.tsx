import { SiteHeader } from "@/components/site-header";
import { RegisterForm } from "./register-formdata";

export default function Register() {
    return (
        <>
            <SiteHeader />
            <div className="mt-20" >
                <RegisterForm />
            </div>
        </>
    )
}
