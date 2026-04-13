import React, { useState } from 'react';
import { TextInput, TextInputProps } from 'flowbite-react';
import { Icon } from '@iconify/react';

interface CustomTextInputProps extends TextInputProps {
  isPassword?: boolean;
}

const CustomTextInput = ({ isPassword, ...props }: CustomTextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [blink, setBlink] = useState(false);

  const togglePassword = () => {
    setBlink(true);
    setTimeout(() => {
      setShowPassword(!showPassword);
      setBlink(false);
    }, 150);
  };

  if (!isPassword) {
    return <TextInput {...props} />;
  }

  return (
    <div className="relative w-full group">
      <TextInput
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={`${props.className || ''} pr-10`}
      />
      <div 
        onClick={togglePassword}
        className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10 p-1 rounded-full hover:bg-gray-100 transition-all duration-200 ${blink ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`}
      >
        <Icon 
          icon={showPassword ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"} 
          className={`text-xl ${showPassword ? 'text-primary' : 'text-gray-400'} transition-colors duration-300`}
        />
      </div>
    </div>
  );
};

export default CustomTextInput;
